// app/api/outages/route.ts
import { getOutages } from "@/lib/utilities/outages";

export async function GET() {
  const data = await getOutages();
  return Response.json(data, { headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300" } });
}
