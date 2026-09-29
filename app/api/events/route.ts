// app/api/events/route.ts
import { fetchEvents } from "@/lib/events/fetchEvents";

export async function GET() {
  const data = await fetchEvents();
  return Response.json(data, {
    headers: { "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600" },
  });
}
