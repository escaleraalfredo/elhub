// lib/events/types.ts
export const EVENT_CATEGORIES = [
  { id: "conciertos", label: "Conciertos", emoji: "🎤" },
  { id: "entretenimiento", label: "Entretenimiento", emoji: "🎭" },
  { id: "juegos", label: "Juegos", emoji: "🏟️" },
  { id: "familia", label: "Familia", emoji: "👨‍👩‍👧" },
  { id: "festivales", label: "Festivales", emoji: "🎉" },
] as const;

export type EventCategory = (typeof EVENT_CATEGORIES)[number]["id"];

export interface EventItem {
  id: string;
  title: string;
  category: EventCategory;
  /** ISO start in UTC. */
  start: string;
  /** YYYY-MM-DD in Puerto Rico time. */
  day: string;
  venue: string;
  city: string;
  image?: string;
  url?: string;
  priceMin?: number;
  priceMax?: number;
  free?: boolean;
  description?: string;
}

export interface EventsResponse {
  events: EventItem[];
  sample: boolean;
  updatedAt: string;
}
