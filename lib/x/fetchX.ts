// lib/x/fetchX.ts
// Server-side X (Twitter) feed for Puerto Rico. Needs X_BEARER_TOKEN from an
// X API plan that includes recent search. Without it we return sample posts.
import { PR_ACCOUNTS, type XPost, type XResponse } from "./types";

const REVALIDATE_SECONDS = 300;

const QUERY = [
  `(("Puerto Rico" OR boricua OR #PuertoRico OR #PR) lang:es -is:retweet -is:reply)`,
  `(${PR_ACCOUNTS.map((a) => `from:${a.username}`).join(" OR ")})`,
].join(" OR ");

interface ApiUser { id: string; name: string; username: string; profile_image_url?: string; verified?: boolean }
interface ApiMedia { media_key: string; type: string; url?: string; preview_image_url?: string }
interface ApiTweet {
  id: string;
  text: string;
  created_at: string;
  author_id: string;
  public_metrics?: { like_count: number; reply_count: number; retweet_count: number };
  attachments?: { media_keys?: string[] };
}

function samplePosts(now: number): XPost[] {
  const mk = (i: number, name: string, username: string, text: string, minutesAgo: number, likes: number): XPost => ({
    id: `sample-${i}`,
    text,
    createdAt: new Date(now - minutesAgo * 60_000).toISOString(),
    url: "https://x.com/search?q=Puerto%20Rico&f=live",
    author: { name, username },
    metrics: { likes, replies: Math.round(likes / 6), reposts: Math.round(likes / 4) },
  });
  return [
    mk(1, "Ejemplo Boricua", "ejemplo_boricua", "Post de ejemplo. Conecta tu cuenta de X (X_BEARER_TOKEN) para ver lo que se está hablando de Puerto Rico en tiempo real. 🇵🇷", 3, 42),
    mk(2, "Tráfico PR (ejemplo)", "ejemplo_trafico", "Ejemplo: tapón en la PR-22 dirección a San Juan a la altura de Bayamón. Salgan temprano.", 11, 18),
    mk(3, "Clima Isla (ejemplo)", "ejemplo_clima", "Ejemplo: aguaceros dispersos esta tarde en el interior y el oeste. Lleven sombrilla ☔", 27, 65),
    mk(4, "Deportes PR (ejemplo)", "ejemplo_deportes", "Ejemplo: ¡Noche de baloncesto! ¿Quién gana hoy en el BSN? 🏀", 48, 90),
  ];
}

export async function fetchX(): Promise<XResponse> {
  const now = Date.now();
  const token = process.env.X_BEARER_TOKEN;
  if (!token) {
    return { posts: samplePosts(now), sample: true, reason: "missing_token", updatedAt: new Date(now).toISOString() };
  }

  const params = new URLSearchParams({
    query: QUERY,
    max_results: "30",
    "tweet.fields": "created_at,public_metrics,attachments",
    expansions: "author_id,attachments.media_keys",
    "user.fields": "name,username,profile_image_url,verified",
    "media.fields": "type,url,preview_image_url",
  });

  try {
    const res = await fetch(`https://api.x.com/2/tweets/search/recent?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(8000),
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) {
      return { posts: samplePosts(now), sample: true, reason: `x_api_${res.status}`, updatedAt: new Date(now).toISOString() };
    }
    const json = (await res.json()) as {
      data?: ApiTweet[];
      includes?: { users?: ApiUser[]; media?: ApiMedia[] };
    };
    const users = new Map((json.includes?.users ?? []).map((u) => [u.id, u]));
    const media = new Map((json.includes?.media ?? []).map((m) => [m.media_key, m]));

    const posts: XPost[] = (json.data ?? []).map((t) => {
      const u = users.get(t.author_id);
      const m = t.attachments?.media_keys?.map((k) => media.get(k)).find(Boolean);
      return {
        id: t.id,
        text: t.text,
        createdAt: t.created_at,
        url: `https://x.com/${u?.username ?? "i"}/status/${t.id}`,
        author: {
          name: u?.name ?? "X",
          username: u?.username ?? "",
          avatar: u?.profile_image_url?.replace("_normal", "_bigger"),
          verified: u?.verified,
        },
        metrics: {
          likes: t.public_metrics?.like_count ?? 0,
          replies: t.public_metrics?.reply_count ?? 0,
          reposts: t.public_metrics?.retweet_count ?? 0,
        },
        image: m?.url ?? m?.preview_image_url,
      };
    });
    return { posts, sample: false, updatedAt: new Date(now).toISOString() };
  } catch {
    return { posts: samplePosts(now), sample: true, reason: "x_api_unreachable", updatedAt: new Date(now).toISOString() };
  }
}
