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
