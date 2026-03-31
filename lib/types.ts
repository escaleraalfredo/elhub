export interface Spot {
  id: number;
  name: string;
  category: string;
  rating: number;
  reviews: number;
  price: string;
  open: boolean;
  vibe: string;
  created_at?: string;
}

export interface NewsReaction {
  id?: string;
  news_id: string;
  emoji: string;
  count: number;
}

export interface NewsComment {
  id?: string;
  news_id: string;
  user_name: string;
  text: string;
  emoji: string;
  created_at?: string;
}

export interface SpotComment {
  id?: string;
  spot_id: number;
  user_name: string;
  text: string;
  emoji: string;
  created_at?: string;
}

export interface CommunityTopic {
  id?: number;
  text: string;
  created_at?: string;
}

export interface TopicComment {
  id?: string;
  topic_id: number;
  user_name: string;
  text: string;
  emoji: string;
  created_at?: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  source: string;
  /** Canonical URL of the original article */
  url?: string;
  image: string;
  views: number;
  upvotes?: number;
  downvotes?: number;
  created_at?: string;
}

export interface TrendingVote {
  id?: string;
  article_id: string;
  direction: "up" | "down";
  created_at?: string;
}

export interface TrendingReaction {
  id?: string;
  article_id: string;
  emoji: string;
  count: number;
}

export interface UserProfile {
  id: string;
  user_name: string;
  avatar_emoji: string;
  points: number;
  streak: number;
  badges: string[];
  check_ins: number;
  created_at?: string;
}

export interface LeaderboardEntry {
  user_name: string;
  avatar_emoji: string;
  points: number;
  badges: string[];
}
