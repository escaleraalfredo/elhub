// app/api/weather/route.ts  —  GET /api/weather?zone=Ponce
import type { NextRequest } from "next/server";
import { getWeather } from "@/lib/utilities/weather";

export async function GET(request: NextRequest) {
  const zone = request.nextUrl.searchParams.get("zone") ?? "San Juan";
  const data = await getWeather(zone);
  return Response.json(data, { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=900" } });
}
