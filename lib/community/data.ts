// lib/community/data.ts
// Demo community content shared by list and detail pages. Comment threads
// are seeded from here and then live in the shared comment store.
"use client";

import type { SeedComment } from "@/lib/comments/store";

export type Vote = "up" | "down" | null;

export const TOPIC_CATEGORIES = [
  "Política", "Comida", "Música", "Deportes", "Isla", "Fiestas",
  "Transporte", "Tecnología", "Cultura", "Otros",
] as const;
export type TopicCategory = (typeof TOPIC_CATEGORIES)[number];

export interface Topic {
  id: number;
  title: string;
  content?: string;
  username: string;
  votes: number;
  userVote: Vote;
  time: string;
  category: TopicCategory;
  seed?: SeedComment[];
}

export const TOPICS: Topic[] = [
  {
    id: 1,
    title: "¿Qué opinan de la nueva ley de marihuana en PR?",
    content:
      "La nueva ley que se aprobó la semana pasada está dando mucho de qué hablar. ¿Creen que va a ayudar a la economía o solo va a traer más problemas? Quiero leer opiniones serias de la gente de la isla.",
    username: "bayamonero",
    votes: 142,
    userVote: null,
    time: "2h",
    category: "Política",
    seed: [
      {
        author: "playero_pr",
        time: "1h",
        likes: 7,
        text: "Yo estoy a favor, pero tiene que haber regulación fuerte. En Piñones ya hay muchos kioskos vendiendo sin control.",
        replies: [
          { author: "santurcevibes", time: "45m", likes: 3, text: "@playero_pr Totalmente de acuerdo. Sin regulación vamos a tener el mismo problema que con el alcohol." },
        ],
      },
      {
        author: "luquillense",
        time: "3h",
        likes: 11,
        text: "Lo que hace falta es educación, no prohibir.",
      },
    ],
  },
  {
    id: 2,
    title: "Recomienden chinchorros buenos y baratos en Piñones este fin de semana",
    username: "playero_pr",
    votes: 96,
    userVote: null,
    time: "5h",
    category: "Comida",
    seed: [
      { author: "loiceña", time: "4h", likes: 9, text: "El de la curva después del puente. Alcapurrias de jueyes brutales 🔥" },
      { author: "bayamonero", time: "3h", likes: 2, text: "Vayan temprano que el domingo eso se llena." },
    ],
  },
  {
    id: 3,
    title: "Bad Bunny vs Residente: ¿Quién ganó el último round de verdad?",
    username: "santurcevibes",
    votes: 203,
    userVote: "up",
    time: "11h",
    category: "Música",
    seed: [{ author: "reggaetonero_787", time: "10h", likes: 21, text: "Benito, sin discusión 🐰" }],
  },
  {
    id: 4,
    title: "¿Cuál es el mejor kiosko de alcapurrias en toda la isla? (serio)",
    username: "luquillense",
    votes: 78,
    userVote: null,
    time: "1d",
    category: "Comida",
  },
];

export interface PollOption {
  id: number;
  text: string;
  votes: number;
}

export interface Poll {
  id: number;
  question: string;
  options: PollOption[];
  time: string;
  userVote: number | null;
  likes: number;
  liked: boolean;
  seed?: SeedComment[];
}

export const POLLS: Poll[] = [
  {
    id: 1,
    question: "¿Cuál es el mejor plato típico boricua?",
    options: [
      { id: 1, text: "Mofongo", votes: 124 },
      { id: 2, text: "Arroz con gandules y pernil", votes: 98 },
      { id: 3, text: "Alcapurrias", votes: 45 },
      { id: 4, text: "Empanadillas", votes: 29 },
    ],
    time: "2h",
    userVote: null,
    likes: 34,
    liked: false,
    seed: [
      {
        author: "playero_pr",
        time: "1h",
        likes: 14,
        text: "Mofongo sin duda. Con un buen chicharrón y ajo está brutal.",
        replies: [{ author: "bayamonero", time: "42m", likes: 5, text: "@playero_pr Con yuca frita y todo 🔥" }],
      },
      { author: "luquillense", time: "3h", likes: 23, text: "Arroz con gandules y pernil los domingos en casa de la abuela es insuperable." },
    ],
  },
  {
    id: 2,
    question: "¿Bad Bunny o Residente? ¿Quién es el rey actual?",
    options: [
      { id: 1, text: "Bad Bunny", votes: 187 },
      { id: 2, text: "Residente", votes: 89 },
      { id: 3, text: "Ambos son cracks", votes: 31 },
    ],
    time: "5h",
    userVote: 1,
    likes: 67,
    liked: true,
    seed: [{ author: "santurcevibes", time: "4h", likes: 8, text: "Esto no es ni competencia 😂" }],
  },
  {
    id: 3,
    question: "¿Debería haber más chinchorros en la playa de Luquillo?",
    options: [
      { id: 1, text: "Sí, hace falta más ambiente", votes: 156 },
      { id: 2, text: "No, ya está muy lleno", votes: 52 },
      { id: 3, text: "Me da igual", votes: 21 },
    ],
    time: "14h",
    userVote: null,
    likes: 19,
    liked: false,
  },
];

export interface Meme {
  id: number;
  username: string;
  image: string;
  caption: string;
  likes: number;
  liked: boolean;
  time: string;
  seed?: SeedComment[];
}

export const MEMES: Meme[] = [
  {
    id: 1,
    username: "bayamonero",
    image: "https://picsum.photos/id/1015/800/800",
    caption: "Cuando el pernil se acaba antes de las 12 🥲",
    likes: 342,
    liked: false,
    time: "15 min",
    seed: [
      { author: "playero_pr", time: "10m", likes: 12, text: "Esto me pasó en Nochebuena 😂😂" },
      { author: "santurcevibes", time: "8m", likes: 4, text: "La tía que llegó tarde 👀", replies: [{ author: "bayamonero", time: "5m", likes: 2, text: "@santurcevibes siempre es la misma 😭" }] },
    ],
  },
  {
    id: 2,
    username: "santurcevibes",
    image: "https://picsum.photos/id/870/800/800",
    caption: "Yo explicándole a mi jefe que el tapón de la 22 no es culpa mía",
    likes: 1240,
    liked: true,
    time: "2 h",
    seed: [{ author: "luquillense", time: "1h", likes: 31, text: "La 22 a las 7am es otro nivel 💀" }],
  },
  {
    id: 3,
    username: "playero_pr",
    image: "https://picsum.photos/id/1016/800/800",
    caption: "Cuando dices 'voy de camino' pero todavía estás en la ducha",
    likes: 892,
    liked: false,
    time: "5 h",
  },
];

export interface Reel {
  id: number;
  username: string;
  caption: string;
  likes: number;
  liked: boolean;
  image: string;
  seed?: SeedComment[];
}

export const REELS: Reel[] = [
  {
    id: 1,
    username: "bayamonero",
    caption: "Un chinchorro en Piñones al atardecer 🔥 ¿Quién viene?",
    likes: 1240,
    liked: false,
    image: "https://picsum.photos/id/1015/1080/1920",
    seed: [{ author: "loiceña", time: "20m", likes: 6, text: "Ese sunset 😍" }],
  },
  {
    id: 2,
    username: "santurcevibes",
    caption: "El Coliseo anoche - la energía estaba brutal",
    likes: 3420,
    liked: true,
    image: "https://picsum.photos/id/870/1080/1920",
    seed: [{ author: "reggaetonero_787", time: "1h", likes: 44, text: "¡Yo estaba ahí! 🔥🔥" }],
  },
];

// ---- Things the user creates (kept on this device) ----

const USER_KEY = "elhub:community:v1";

interface UserContent {
  topics: Topic[];
  polls: Poll[];
}

export function loadUserContent(): UserContent {
  if (typeof window === "undefined") return { topics: [], polls: [] };
  try {
    const raw = window.localStorage.getItem(USER_KEY);
    const parsed = raw ? (JSON.parse(raw) as Partial<UserContent>) : {};
    return { topics: parsed.topics ?? [], polls: parsed.polls ?? [] };
  } catch {
    return { topics: [], polls: [] };
  }
}

export function saveUserContent(update: Partial<UserContent>) {
  try {
    window.localStorage.setItem(USER_KEY, JSON.stringify({ ...loadUserContent(), ...update }));
  } catch {
    // ignore storage errors
  }
}
