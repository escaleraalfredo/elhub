// app/api/news/route.ts
import { fetchNews } from "@/lib/news/fetchNews";

export async function GET() {
  const data = await fetchNews();
  return Response.json(data, {
    headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
  });
}
