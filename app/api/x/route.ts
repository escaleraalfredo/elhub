// app/api/x/route.ts
import { fetchX } from "@/lib/x/fetchX";

export async function GET() {
  const data = await fetchX();
  return Response.json(data, {
    headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
  });
}
