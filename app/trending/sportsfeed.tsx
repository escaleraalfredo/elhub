// app/trending/sportsfeed.tsx
"use client";

import { useState, useEffect } from "react";
import { Heart, Smile, MessageCircle, Zap, Trophy, Clock, RefreshCw } from "lucide-react";
import { useGamification } from "@/lib/gamificationContext";

interface Game {
  id: string;
  league: string;
  home: string;
  away: string;
  homeScore: number;
  awayScore: number;
  status: "Live" | "Final" | "Upcoming";
  quarter?: number;
  clock?: string;
  inning?: number;
  outs?: number;
  menOnBase?: string;
  votes: number;
  time?: string;
  venue?: string;
  homeLogo?: string;
  awayLogo?: string;
}

export default function SportsFeed() {
  const { addPoints } = useGamification();

  const [games, setGames] = useState<Game[]>([]);
  const [showStandings, setShowStandings] = useState(false);
  const [standingsTab, setStandingsTab] = useState<"conference" | "division">("conference");
  const [userVotes, setUserVotes] = useState<Record<string, boolean>>({});
  const [openEmojiPicker, setOpenEmojiPicker] = useState<string | null>(null);
  const [emojiReactions, setEmojiReactions] = useState<Record<string, Record<string, number>>>({});
  const [selectedLeague, setSelectedLeague] = useState<"NBA" | "MLB" | "BSN" | "LAPRO">("BSN");
  const [statusFilter, setStatusFilter] = useState<"Live" | "Upcoming">("Live");
  const [loading, setLoading] = useState(false);

  const emojis = ["🔥","❤️","🙌","😂","😢","😡","🤬","💩","👏","🙏","🌴","🍍","🍺","🎉","👀","🤦‍♂️","👍","👎","🥳","😱","🤔","🇵🇷","😍","💯"];

  const mockGames: Record<string, Game[]> = {
    NBA: [
      {
        id: "nba1", league: "NBA", home: "Lakers", away: "Warriors",
        homeScore: 118, awayScore: 112, status: "Live", quarter: 4, clock: "1:45",
        votes: 3240, venue: "Crypto.com Arena",
        homeLogo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Los_Angeles_Lakers_logo.svg/512px-Los_Angeles_Lakers_logo.svg.png",
        awayLogo: "https://upload.wikimedia.org/wikipedia/en/thumb/0/01/Golden_State_Warriors_logo.svg/512px-Golden_State_Warriors_logo.svg.png"
      },
      {
        id: "nba2", league: "NBA", home: "Celtics", away: "Heat",
        homeScore: 104, awayScore: 97, status: "Live", quarter: 3, clock: "6:22",
        votes: 2180, venue: "TD Garden",
        homeLogo: "https://upload.wikimedia.org/wikipedia/en/thumb/8/8f/Boston_Celtics.svg/512px-Boston_Celtics.svg.png",
        awayLogo: "https://upload.wikimedia.org/wikipedia/en/thumb/f/f6/Miami_Heat_logo.svg/512px-Miami_Heat_logo.svg.png"
      },
      {
        id: "nba3", league: "NBA", home: "Knicks", away: "Nets",
        homeScore: 0, awayScore: 0, status: "Upcoming", time: "19:30",
        votes: 980, venue: "Madison Square Garden",
        homeLogo: "https://upload.wikimedia.org/wikipedia/en/thumb/2/25/New_York_Knicks_logo.svg/512px-New_York_Knicks_logo.svg.png",
        awayLogo: "https://upload.wikimedia.org/wikipedia/en/thumb/4/4b/Brooklyn_Nets_logo.svg/512px-Brooklyn_Nets_logo.svg.png"
      },
    ],
    MLB: [
      {
        id: "mlb1", league: "MLB", home: "Yankees", away: "Red Sox",
        homeScore: 6, awayScore: 4, status: "Live", inning: 8, outs: 1,
        votes: 1870, venue: "Yankee Stadium",
        homeLogo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/New_York_Yankees_Logo.svg/512px-New_York_Yankees_Logo.svg.png",
        awayLogo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Boston_Red_Sox_Logo.svg/512px-Boston_Red_Sox_Logo.svg.png"
      },
    ],
    BSN: [
      {
        id: "bsn1", league: "BSN", home: "Capitanes", away: "Vaqueros",
        homeScore: 89, awayScore: 84, status: "Live", quarter: 4, clock: "3:12",
        votes: 2310, venue: "Coliseo Roberto Clemente",
        homeLogo: "https://bsnpr.com/wp-content/uploads/2024/10/capitanes-logo.png",
        awayLogo: "https://bsnpr.com/wp-content/uploads/2024/10/vaqueros-logo.png"
      },
    ],
    LAPRO: [
      {
        id: "lapro1", league: "LAPRO", home: "Indios", away: "Cangrejeros",
        homeScore: 7, awayScore: 5, status: "Live", inning: 7, outs: 2,
        votes: 1680, venue: "Estadio Isidoro García",
        homeLogo: "https://upload.wikimedia.org/wikipedia/commons/8/8f/Indios_de_Mayaguez_logo.png",
        awayLogo: "https://upload.wikimedia.org/wikipedia/commons/8/8f/Cangrejeros_de_Santurce_logo.png"
      },
    ],
  };

  const mockStandings: Record<string, any> = {
    NBA: {
      conference: {
        East: [
          { team: "Celtics", wins: 58, losses: 24, pct: ".707" },
          { team: "Knicks", wins: 52, losses: 30, pct: ".634" },
          { team: "76ers", wins: 49, losses: 33, pct: ".598" },
          { team: "Heat", wins: 46, losses: 36, pct: ".561" },
          { team: "Bucks", wins: 48, losses: 34, pct: ".585" },
        ],
        West: [
          { team: "Clippers", wins: 51, losses: 31, pct: ".622" },
          { team: "Suns", wins: 49, losses: 33, pct: ".598" },
          { team: "Lakers", wins: 47, losses: 35, pct: ".573" },
          { team: "Warriors", wins: 45, losses: 37, pct: ".549" },
          { team: "Mavericks", wins: 50, losses: 32, pct: ".610" },
        ],
      },
      division: {
        Atlantic: [
          { team: "Celtics", wins: 58, losses: 24, pct: ".707" },
          { team: "Knicks", wins: 52, losses: 30, pct: ".634" },
          { team: "76ers", wins: 49, losses: 33, pct: ".598" },
        ],
        Central: [{ team: "Bucks", wins: 48, losses: 34, pct: ".585" }],
        Southeast: [{ team: "Heat", wins: 46, losses: 36, pct: ".561" }],
      },
    },
    MLB: {
      conference: {
        "American League": [
          { team: "Yankees", wins: 94, losses: 68, pct: ".580" },
          { team: "Orioles", wins: 91, losses: 71, pct: ".562" },
        ],
        "National League": [
          { team: "Dodgers", wins: 98, losses: 64, pct: ".605" },
          { team: "Phillies", wins: 95, losses: 67, pct: ".586" },
        ],
      },
      division: {
        "AL East": [
          { team: "Yankees", wins: 94, losses: 68, pct: ".580" },
          { team: "Orioles", wins: 91, losses: 71, pct: ".562" },
        ],
        "NL East": [
          { team: "Phillies", wins: 95, losses: 67, pct: ".586" },
        ],
        "NL West": [{ team: "Dodgers", wins: 98, losses: 64, pct: ".605" }],
      },
    },
    BSN: {
      conference: {
        "Grupo A": [
          { team: "Capitanes", wins: 22, losses: 8, pct: ".733" },
          { team: "Vaqueros", wins: 19, losses: 11, pct: ".633" },
          { team: "Atenienses", wins: 17, losses: 13, pct: ".567" },
        ],
        "Grupo B": [
          { team: "Leones", wins: 18, losses: 12, pct: ".600" },
          { team: "Indios", wins: 15, losses: 15, pct: ".500" },
        ],
      },
    },
    LAPRO: {
      conference: {
        Norte: [
          { team: "Indios", wins: 28, losses: 12, pct: ".700" },
          { team: "Cangrejeros", wins: 24, losses: 16, pct: ".600" },
        ],
        Sur: [
          { team: "Gigantes", wins: 23, losses: 17, pct: ".575" },
          { team: "Criollos", wins: 19, losses: 21, pct: ".475" },
        ],
      },
    },
  };

  const currentStandings = mockStandings[selectedLeague];

  const handleManualRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setGames([...mockGames[selectedLeague]]);
      setLoading(false);
    }, 650);
  };

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      let filtered = [...mockGames[selectedLeague]];
      if (statusFilter === "Live") {
        filtered = filtered.filter((g) => g.status === "Live");
      } else {
        filtered = filtered.filter((g) => g.status !== "Live");
      }
      setGames(filtered);
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [selectedLeague, statusFilter]);

  const handleVote = (id: string) => {
    setGames((prev) => prev.map((game) => (game.id === id ? { ...game, votes: game.votes + 50 } : game)));
    setUserVotes((prev) => ({ ...prev, [id]: true }));
    addPoints(8, "Sports vote");
  };

  const handleReaction = (id: string, emoji: string) => {
    setEmojiReactions((prev) => ({
      ...prev,
      [id]: { ...(prev[id] || {}), [emoji]: (prev[id]?.[emoji] || 0) + 1 },
    }));
    addPoints(3, "Sports emoji reaction");
    setOpenEmojiPicker(null);
  };

  const renderGameDetails = (game: Game) => {
    if (game.status === "Upcoming" && game.time) return `Hoy • ${game.time}`;
    if (game.league === "NBA" || game.league === "BSN") {
      return game.quarter && game.clock ? `Q${game.quarter} • ${game.clock}` : null;
    }
    if (game.league === "MLB" || game.league === "LAPRO") {
      return game.inning ? `Inning ${game.inning} • ${game.outs} outs` : null;
    }
    return null;
  };

  return (
    <div className="bg-zinc-950 min-h-screen pb-20">
      {/* Header - same as before */}
      <div className="sticky top-0 z-30 bg-zinc-950 border-b border-zinc-800 pt-4 pb-3 px-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-white">Sports</h1>
          <button onClick={handleManualRefresh} disabled={loading}>
            <RefreshCw className={`w-5 h-5 text-zinc-400 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        <div className="flex gap-2 pb-3 overflow-x-auto scrollbar-hide">
          {(["NBA", "MLB", "BSN", "LAPRO"] as const).map((league) => (
            <button
              key={league}
              onClick={() => setSelectedLeague(league)}
              className={`px-6 py-2.5 rounded-2xl text-sm font-semibold whitespace-nowrap transition-all ${
                selectedLeague === league ? "bg-pr-red text-white" : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800"
              }`}
            >
              {league}
            </button>
          ))}
        </div>

        <div className="flex bg-zinc-900 rounded-2xl p-1">
          {["Live", "Upcoming"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status as "Live" | "Upcoming")}
              className={`flex-1 py-3 rounded-[14px] text-sm font-medium transition-all ${
                statusFilter === status ? "bg-white text-black shadow" : "text-zinc-400"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Standings Toggle */}
      <div className="px-4 mt-4">
        <button
          onClick={() => setShowStandings(!showStandings)}
          className="w-full flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 py-4 rounded-3xl text-sm font-semibold transition-all"
        >
          <Trophy className="w-5 h-5" />
          {showStandings ? "Ocultar Tabla" : "Ver Tabla de Posiciones"}
        </button>
      </div>

      {/* Standings Panel */}
      {showStandings && currentStandings && (
        <div className="mx-4 mt-4 bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-800">
          <div className="px-6 py-4 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
            <span className="font-semibold">Tabla — {selectedLeague}</span>
            <span className="text-xs text-zinc-500">2025-26</span>
          </div>

          {(selectedLeague === "NBA" || selectedLeague === "MLB") && (
            <div className="flex border-b border-zinc-800">
              <button
                onClick={() => setStandingsTab("conference")}
                className={`flex-1 py-3 text-sm font-medium ${standingsTab === "conference" ? "text-white border-b-2 border-pr-red" : "text-zinc-400"}`}
              >
                Conferencia
              </button>
              <button
                onClick={() => setStandingsTab("division")}
                className={`flex-1 py-3 text-sm font-medium ${standingsTab === "division" ? "text-white border-b-2 border-pr-red" : "text-zinc-400"}`}
              >
                División
              </button>
            </div>
          )}

          <div className="p-6 space-y-8 text-sm">
            {standingsTab === "conference" && currentStandings.conference &&
              Object.entries(currentStandings.conference).map(([group, teams]) => (
                <div key={group}>
                  <h3 className="text-amber-400 font-bold mb-3">{group}</h3>
                  <div className="space-y-4">
                    {(teams as any[]).map((team, i) => (
                      <div key={i} className="flex justify-between items-center">
                        <span className="font-medium">{team.team}</span>
                        <div className="font-mono flex gap-6 text-zinc-300">
                          <span>{team.wins}-{team.losses}</span>
                          <span className="text-emerald-400 font-bold">{team.pct}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Games Feed */}
      <div className="px-4 mt-6 space-y-5">
        {games.map((game) => {
          const isLive = game.status === "Live";
          const reactions = emojiReactions[game.id] || {};
          const hasReactions = Object.keys(reactions).length > 0;

          return (
            <div
              key={game.id}
              className="bg-zinc-900 rounded-3xl border border-zinc-800 overflow-hidden relative"
            >
              {/* League Header */}
              <div className="px-5 pt-4 pb-2 flex justify-between items-center">
                <span className="uppercase text-xs font-bold tracking-widest text-zinc-500">{game.league}</span>
                {renderGameDetails(game) && (
                  <span className="text-xs text-zinc-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {renderGameDetails(game)}
                  </span>
                )}
              </div>

              {/* Score Area */}
              <div className="px-5 py-6 flex items-center">
                {/* Away */}
                <div className="flex-1 flex flex-col items-center">
                  {game.awayLogo && <img src={game.awayLogo} alt={game.away} className="w-12 h-12 object-contain mb-2" />}
                  <div className="text-sm font-medium text-white text-center">{game.away}</div>
                  <div className="text-6xl font-black tabular-nums text-white mt-1">{game.awayScore}</div>
                </div>

                {/* VS + LIVE */}
                <div className="flex flex-col items-center px-8">
                  <div className="text-xs tracking-widest text-zinc-500 mb-3">VS</div>
                  {isLive && (
                    <div className="bg-red-600 text-white text-xs font-bold px-5 py-1 rounded-full flex items-center gap-1 shadow animate-pulse">
                      <Zap className="w-4 h-4" /> LIVE
                    </div>
                  )}
                </div>

                {/* Home */}
                <div className="flex-1 flex flex-col items-center">
                  {game.homeLogo && <img src={game.homeLogo} alt={game.home} className="w-12 h-12 object-contain mb-2" />}
                  <div className="text-sm font-medium text-white text-center">{game.home}</div>
                  <div className="text-6xl font-black tabular-nums text-white mt-1">{game.homeScore}</div>
                </div>
              </div>

              {/* Reactions */}
              {hasReactions && (
                <div className="px-5 pb-4 flex flex-wrap gap-2 border-t border-zinc-800 pt-4">
                  {Object.entries(reactions).map(([emoji, count]) => (
                    <div
                      key={emoji}
                      onClick={() => handleReaction(game.id, emoji)}
                      className="bg-zinc-800 hover:bg-zinc-700 px-4 py-1.5 rounded-2xl text-base flex items-center gap-2 cursor-pointer active:scale-95 transition-all"
                    >
                      {emoji} <span className="text-xs text-zinc-400">{count}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Action Bar */}
              <div className="px-5 py-5 border-t border-zinc-800 flex justify-between items-center">
                <div className="flex gap-8">
                  <button
                    onClick={() => handleVote(game.id)}
                    disabled={!!userVotes[game.id]}
                    className={`flex items-center gap-2 ${userVotes[game.id] ? "text-red-500" : "text-zinc-400 hover:text-white"} transition-all`}
                  >
                    <Heart className={`w-5 h-5 ${userVotes[game.id] ? "fill-current" : ""}`} />
                    <span className="font-mono text-sm">{game.votes}</span>
                  </button>

                  <button className="text-zinc-400 hover:text-white transition-colors">
                    <MessageCircle className="w-5 h-5" />
                  </button>
                </div>

                <button
                  onClick={() => setOpenEmojiPicker(openEmojiPicker === game.id ? null : game.id)}
                  className="text-zinc-400 hover:text-white"
                >
                  <Smile className="w-6 h-6" />
                </button>
              </div>

              {/* FIXED Emoji Picker - Smaller, IG-style, opens downward */}
              {openEmojiPicker === game.id && (
                <div className="absolute bottom-[-12px] left-1/2 -translate-x-1/2 bg-zinc-900 border border-zinc-700 rounded-3xl p-4 shadow-2xl z-50 flex flex-wrap gap-3 max-w-[280px]">
                  {emojis.slice(0, 15).map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => handleReaction(game.id, emoji)}
                      className="text-3xl hover:scale-125 active:scale-110 transition-transform p-2 rounded-xl hover:bg-zinc-800 w-10 h-10 flex items-center justify-center"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {games.length === 0 && !loading && (
        <div className="text-center mt-20 text-zinc-500 px-4">
          No hay juegos {statusFilter.toLowerCase()} para {selectedLeague} en este momento.
        </div>
      )}

      {loading && <div className="text-center mt-20 text-zinc-500">Actualizando...</div>}

      <div className="text-center py-12 text-xs text-zinc-600">
        Datos de demostración • ¡Vota por tu equipo favorito! 🇵🇷
      </div>
    </div>
  );
}