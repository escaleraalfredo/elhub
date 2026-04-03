"use client";

import { useEffect, useState } from "react";

type Game = {
  id: string;
  league: string;
  home: string;
  away: string;
  homeScore: string;
  awayScore: string;
  status: string;
};

export default function SportsFeed() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeague, setSelectedLeague] = useState("NBA"); // default league

  const fetchScores = async () => {
    try {
      const endpoints = [
        "https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard",
        "https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard",
        "https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/scoreboard",
        "https://site.api.espn.com/apis/site/v2/sports/mma/ufc/scoreboard",
        // Add BSN and LAPRO API endpoints here if available
        // e.g., "https://your-pr-api/bsn/scoreboard",
        //       "https://your-pr-api/lapro/scoreboard",
      ];

      const responses = await Promise.all(endpoints.map((url) => fetch(url)));
      const data = await Promise.all(responses.map((res) => res.json()));

      const parsedGames: Game[] = [];

      data.forEach((leagueData) => {
        leagueData.events?.forEach((event: any) => {
          const comp = event.competitions?.[0];
          if (!comp) return;

          const home = comp.competitors?.[0];
          const away = comp.competitors?.[1];

          parsedGames.push({
            id: event.id,
            league: leagueData.league?.name || "League",
            home: home?.athlete?.displayName || home?.team?.shortDisplayName || "TBD",
            away: away?.athlete?.displayName || away?.team?.shortDisplayName || "TBD",
            homeScore: home?.score || "-",
            awayScore: away?.score || "-",
            status: comp.status?.type?.description || "Scheduled",
          });
        });
      });

      setGames(parsedGames);
    } catch (err) {
      console.error("Error fetching scores:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScores();
    const interval = setInterval(fetchScores, 30000);
    return () => clearInterval(interval);
  }, []);

  // Filter games by selected league
  const filteredGames = games.filter(
    (game) => game.league.toLowerCase() === selectedLeague.toLowerCase()
  );

  return (
    <div className="text-white space-y-6">
      {/* Header */}
      <h1 className="text-xl font-bold">Live Sports</h1>

      {/* League Selector */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {["NBA", "NFL", "MLB", "BSN", "LAPRO", "UFC"].map((league) => (
          <button
            key={league}
            onClick={() => setSelectedLeague(league)}
            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all duration-200 ${
              selectedLeague === league
                ? "bg-white text-black font-semibold shadow-md shadow-white/10"
                : "bg-zinc-800 text-zinc-300"
            }`}
          >
            {league}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && <div className="text-zinc-400">Loading scores...</div>}

      {/* Empty */}
      {!loading && filteredGames.length === 0 && (
        <div className="text-zinc-500">No games available</div>
      )}

      {/* Games */}
      <div className="space-y-4">
        {filteredGames.map((game) => {
          const isLive = game.status.toLowerCase().includes("live");

          return (
            <div
              key={game.id}
              className="bg-zinc-900 rounded-2xl p-4 flex flex-col gap-3"
            >
              {/* League + Status */}
              <div className="flex justify-between text-xs text-zinc-400">
                <span>{game.league}</span>
                <span className={isLive ? "text-red-500 font-semibold" : ""}>
                  {game.status}
                </span>
              </div>

              {/* Teams / Fighters */}
              <div className="flex justify-between items-center text-sm">
                <div className="flex flex-col">
                  <span>{game.away}</span>
                  <span className="text-zinc-400 text-xs">Away</span>
                </div>

                <div className="text-lg font-bold">
                  {game.awayScore} - {game.homeScore}
                </div>

                <div className="flex flex-col text-right">
                  <span>{game.home}</span>
                  <span className="text-zinc-400 text-xs">Home</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}