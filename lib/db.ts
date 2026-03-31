import { supabase } from "./supabase";
import type { CommunityTopic, NewsArticle, NewsComment, Spot, SpotComment, TopicComment } from "./types";

// ─── News Reactions ───────────────────────────────────────────────────────────

export async function getNewsReactions(
  newsId: string
): Promise<Record<string, number>> {
  if (!supabase) return {};
  const { data, error } = await supabase
    .from("news_reactions")
    .select("emoji, count")
    .eq("news_id", newsId);
  if (error || !data) return {};
  return Object.fromEntries(data.map((r) => [r.emoji, r.count]));
}

export async function incrementNewsReaction(
  newsId: string,
  emoji: string
): Promise<void> {
  if (!supabase) return;

  // Try to fetch existing row
  const { data } = await supabase
    .from("news_reactions")
    .select("id, count")
    .eq("news_id", newsId)
    .eq("emoji", emoji)
    .maybeSingle();

  if (data) {
    await supabase
      .from("news_reactions")
      .update({ count: data.count + 1 })
      .eq("id", data.id);
  } else {
    await supabase
      .from("news_reactions")
      .insert({ news_id: newsId, emoji, count: 1 });
  }
}

// ─── News Comments ────────────────────────────────────────────────────────────

export async function getNewsComments(
  newsId: string
): Promise<NewsComment[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("news_comments")
    .select("*")
    .eq("news_id", newsId)
    .order("created_at", { ascending: true });
  if (error || !data) return [];
  return data as NewsComment[];
}

export async function addNewsComment(
  newsId: string,
  text: string,
  userName = "Tú",
  emoji = "👍"
): Promise<NewsComment | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("news_comments")
    .insert({ news_id: newsId, text, user_name: userName, emoji })
    .select()
    .single();
  if (error || !data) return null;
  return data as NewsComment;
}

// ─── Spots ────────────────────────────────────────────────────────────────────

export async function getSpots(): Promise<Spot[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("spots")
    .select("*")
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data as Spot[];
}

export async function addSpot(
  spot: Omit<Spot, "id" | "created_at">
): Promise<Spot | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("spots")
    .insert(spot)
    .select()
    .single();
  if (error || !data) return null;
  return data as Spot;
}

// ─── Spot Comments ────────────────────────────────────────────────────────────

export async function getSpotComments(
  spotId: number
): Promise<SpotComment[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("spot_comments")
    .select("*")
    .eq("spot_id", spotId)
    .order("created_at", { ascending: true });
  if (error || !data) return [];
  return data as SpotComment[];
}

export async function addSpotComment(
  spotId: number,
  text: string,
  userName = "Tú",
  emoji = "👍"
): Promise<SpotComment | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("spot_comments")
    .insert({ spot_id: spotId, text, user_name: userName, emoji })
    .select()
    .single();
  if (error || !data) return null;
  return data as SpotComment;
}

// ─── Community Topics ─────────────────────────────────────────────────────────

export async function getCommunityTopics(): Promise<CommunityTopic[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("community_topics")
    .select("*")
    .order("created_at", { ascending: true });
  if (error || !data) return [];
  return data as CommunityTopic[];
}

export async function addCommunityTopic(
  text: string
): Promise<CommunityTopic | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("community_topics")
    .insert({ text })
    .select()
    .single();
  if (error || !data) return null;
  return data as CommunityTopic;
}

// ─── Topic Comments ───────────────────────────────────────────────────────────

export async function getTopicComments(
  topicId: number
): Promise<TopicComment[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("topic_comments")
    .select("*")
    .eq("topic_id", topicId)
    .order("created_at", { ascending: true });
  if (error || !data) return [];
  return data as TopicComment[];
}

export async function addTopicComment(
  topicId: number,
  text: string,
  userName = "Tú",
  emoji = "💬"
): Promise<TopicComment | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("topic_comments")
    .insert({ topic_id: topicId, text, user_name: userName, emoji })
    .select()
    .single();
  if (error || !data) return null;
  return data as TopicComment;
}

// ─── News Articles ────────────────────────────────────────────────────────────

export async function getNewsArticles(): Promise<NewsArticle[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("news_articles")
    .select("*")
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data as NewsArticle[];
}

export async function getTrendingArticles(limit = 3): Promise<NewsArticle[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("news_articles")
    .select("*")
    .order("views", { ascending: false })
    .limit(limit);
  if (error || !data) return [];
  return data as NewsArticle[];
}
