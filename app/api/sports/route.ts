// app/api/sports/route.ts
// GET /api/sports?league=nba&date=YYYYMMDD
import type { NextRequest } from "next/server";
import { getLeague } from "@/lib/sports/getLeague";
import { dateKey, leagueById } from "@/lib/sports/leagues";
import type { LeagueId } from "@/lib/sports/types";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const league = params.get("league") ?? "bsn";
  const date = params.get("date") ?? dateKey();

  if (!leagueById(league)) {
    return Response.json({ error: "Liga desconocida" }, { status: 400 });
  }
  if (!/^\d{8}$/.test(date)) {
    return Response.json({ error: "Fecha inválida (YYYYMMDD)" }, { status: 400 });
  }

  const data = await getLeague(league as LeagueId, date);
  const live = data.games.some((g) => g.state === "in");
  return Response.json(data, {
    headers: { "Cache-Control": `public, s-maxage=${live ? 20 : 120}, stale-while-revalidate=300` },
  });
}
