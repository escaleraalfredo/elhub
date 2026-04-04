"use client";

import { useState, useEffect, useRef } from "react";

export default function SportsFeed() {
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeague, setSelectedLeague] = useState("BSN");
  const [statusFilter, setStatusFilter] = useState<"All" | "Live" | "Upcoming">("All");

  const prevScores = useRef<Record<string, { home: number; away: number }>>({});

  const fakeGames = [
    {
      id: "bsn1",
      league: "BSN",
      home: "Capitanes",
      away: "Vaqueros",
      homeScore: 85,
      awayScore: 88,
      status: "Live",
      quarter: 4,
      clock: "01:10",
    },
    {
      id: "bsn2",
      league: "BSN",
      home: "Atenienses",
      away: "Piratas",
      homeScore: 72,
      awayScore: 69,
      status: "Live",
      quarter: 3,
      clock: "05:45",
    },
    {
      id: "lapro1",
      league: "LAPRO",
      home: "Indios",
      away: "Cangrejeros",
      homeScore: 4,
      awayScore: 2,
      status: "Live",
      inning: 6,
      outs: 1,
    },
    {
      id: "nba1",
      league: "NBA",
      home: "Lakers",
      away: "Heat",
      homeScore: 102,
      awayScore: 98,
      status: "Live",
      quarter: 4,
      clock: "02:15",
    }
  ];

  const fetchScores = () => {
    setGames((prev) => {
      const newGames = fakeGames.map((g) => {
        const prevScore = prevScores.current[g.id];
        if (prevScore && g.status === "Live") {
          if (Math.random() > 0.7) g.homeScore += Math.floor(Math.random() * 3);
          if (Math.random() > 0.7) g.awayScore += Math.floor(Math.random() * 3);
        }
        prevScores.current[g.id] = { home: g.homeScore, away: g.awayScore };
        return g;
      });
      return newGames;
    });
    setLoading(false);
  };

  useEffect(() => {
    fetchScores();
    const interval = setInterval(fetchScores, 15000);
    return () => clearInterval(interval);
  }, []);

  const filteredGames = games
    .filter((g) => g.league.toLowerCase() === selectedLeague.toLowerCase())
    .filter((g) => {
      if (statusFilter === "All") return true;
      if (statusFilter === "Live") return g.status.toLowerCase() === "live";
      if (statusFilter === "Upcoming") return g.status.toLowerCase() !== "live";
      return true;
    });

  const renderSportDetails = (game: any) => {
    switch (game.league) {
      case "NBA":
      case "BSN":
        return game.quarter ? `Q${game.quarter} • ${game.clock}` : null;
      case "LAPRO":
        return game.inning ? `Inning ${game.inning}` : null;
      default:
        return null;
    }
  };

  return (
    <div className="text-white">
      <div className="sticky top-0 z-20 bg-zinc-900 py-3 border-b border-zinc-800">
        <div className="flex gap-2 pb-3 overflow-x-auto scrollbar-hide">
          {["BSN", "LAPRO", "NBA", "NFL", "MLB", "UFC"].map((league) => (
            <button
              key={league}
              onClick={() => setSelectedLeague(league)}
              className={`px-5 py-2 rounded-full text-sm whitespace-nowrap transition-all ${
                selectedLeague === league
                  ? "bg-pr-red text-white font-semibold"
                  : "bg-zinc-800 text-zinc-300"
              }`}
            >
              {league}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          {["All", "Live", "Upcoming"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status as any)}
              className={`px-4 py-1 rounded-full text-sm transition-all ${
                statusFilter === status
                  ? "bg-white text-black font-semibold"
                  : "bg-zinc-800 text-zinc-300"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {loading && <div className="text-zinc-400 mt-8 text-center">Cargando scores...</div>}

      <div className="flex flex-col gap-4 mt-4">
        {filteredGames.map((game) => {
          const isLive = game.status.toLowerCase() === "live";
          const showScore = game.league !== "UFC";

          return (
            <div
              key={game.id}
              className={`bg-zinc-900 rounded-3xl p-5 border ${isLive ? "border-red-500" : "border-zinc-800"}`}
            >
              <div className="flex justify-between text-xs text-zinc-400 mb-3">
                <span>{game.league}</span>
                <span className={isLive ? "text-red-500 font-bold" : ""}>{game.status}</span>
              </div>

              <div className="flex justify-between items-center">
                <div className="text-center flex-1">
                  <div className="font-semibold">{game.away}</div>
                  {showScore && <div className="text-3xl font-bold mt-1">{game.awayScore}</div>}
                </div>

                <div className="text-2xl text-zinc-500 mx-4">VS</div>

                <div className="text-center flex-1">
                  <div className="font-semibold">{game.home}</div>
                  {showScore && <div className="text-3xl font-bold mt-1">{game.homeScore}</div>}
                </div>
              </div>

              {renderSportDetails(game) && (
                <div className="text-center text-xs text-zinc-400 mt-4">
                  {renderSportDetails(game)}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredGames.length === 0 && !loading && (
        <div className="text-center text-zinc-500 mt-12">No hay juegos en este momento</div>
      )}
    </div>
  );
}