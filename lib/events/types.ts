// lib/events/types.ts
export const EVENT_CATEGORIES = [
  { id: "conciertos", label: "Conciertos", emoji: "🎤" },
  { id: "entretenimiento", label: "Entretenimiento", emoji: "🎭" },
  { id: "juegos", label: "Juegos", emoji: "🏟️" },
  { id: "familia", label: "Familia", emoji: "👨‍👩‍👧" },
  { id: "festivales", label: "Festivales", emoji: "🎉" },
  { id: "patronales", label: "Patronales", emoji: "⛪" },
  { id: "nocturna", label: "Vida nocturna", emoji: "🌙" },
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
  /** Puerto Rican event in the States (shown in "Desde afuera" mode). */
  diaspora?: boolean;
  /** Dates are a reference, not a confirmed program. */
  approximate?: boolean;
}

export interface EventsResponse {
  events: EventItem[];
  sample: boolean;
  updatedAt: string;
}
