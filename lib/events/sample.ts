// lib/events/sample.ts
// Example events at real Puerto Rico venues, used until a ticketing feed
// (TICKETMASTER_API_KEY) is configured. Titles are generic on purpose.
import type { EventCategory, EventItem } from "./types";

const VENUES = {
  coliseo: { venue: "Coliseo de Puerto Rico", city: "San Juan" },
  coca: { venue: "Coca-Cola Music Hall", city: "San Juan" },
  bellas: { venue: "Centro de Bellas Artes", city: "San Juan" },
  hiram: { venue: "Estadio Hiram Bithorn", city: "San Juan" },
  tito: { venue: "Anfiteatro Tito Puente", city: "San Juan" },
  tapia: { venue: "Teatro Tapia", city: "San Juan" },
  distrito: { venue: "Distrito T-Mobile", city: "San Juan" },
  ruben: { venue: "Coliseo Rubén Rodríguez", city: "Bayamón" },
  loubriel: { venue: "Estadio Juan Ramón Loubriel", city: "Bayamón" },
  perla: { venue: "Teatro La Perla", city: "Ponce" },
  pachin: { venue: "Coliseo Juan “Pachín” Vicéns", city: "Ponce" },
  placitaMay: { venue: "Plaza Colón", city: "Mayagüez" },
  caguas: { venue: "Plaza Palmer", city: "Caguas" },
  carolina: { venue: "Coliseo Guillermo Angulo", city: "Carolina" },
  luquillo: { venue: "Balneario La Monserrate", city: "Luquillo" },
} as const;

type Def = {
  title: string;
  category: EventCategory;
  v: keyof typeof VENUES;
  inDays: number;
  time: string;
  price?: [number, number];
  free?: boolean;
  description?: string;
};

const DEFS: Def[] = [
  { title: "Noche de Salsa en Vivo (ejemplo)", category: "conciertos", v: "coca", inDays: 0, time: "20:00", price: [35, 90] },
  { title: "Stand-up: Comedia Boricua (ejemplo)", category: "entretenimiento", v: "tapia", inDays: 0, time: "20:30", price: [25, 45] },
  { title: "Baloncesto: juego de temporada (ejemplo)", category: "juegos", v: "ruben", inDays: 1, time: "19:30", price: [10, 30] },
  { title: "Bomba y Plena en la Plaza (ejemplo)", category: "festivales", v: "caguas", inDays: 2, time: "18:00", free: true, description: "Música en vivo, kioskos y artesanías." },
  { title: "Reggaetón Fest (ejemplo)", category: "conciertos", v: "coliseo", inDays: 3, time: "21:00", price: [55, 250] },
  { title: "Cine bajo las estrellas (ejemplo)", category: "familia", v: "tito", inDays: 3, time: "19:00", free: true },
  { title: "Orquesta Sinfónica: Clásicos (ejemplo)", category: "conciertos", v: "bellas", inDays: 4, time: "20:00", price: [20, 60] },
  { title: "Béisbol: doble tanda (ejemplo)", category: "juegos", v: "loubriel", inDays: 4, time: "18:00", price: [8, 15] },
  { title: "Festival de Chinchorreo (ejemplo)", category: "festivales", v: "luquillo", inDays: 5, time: "12:00", free: true },
  { title: "Teatro musical (ejemplo)", category: "entretenimiento", v: "perla", inDays: 6, time: "20:00", price: [30, 75] },
  { title: "Show infantil de títeres (ejemplo)", category: "familia", v: "bellas", inDays: 6, time: "11:00", price: [12, 18] },
  { title: "Trap Night (ejemplo)", category: "conciertos", v: "distrito", inDays: 7, time: "22:00", price: [30, 80] },
  { title: "Boxeo: cartelera local (ejemplo)", category: "juegos", v: "carolina", inDays: 8, time: "19:00", price: [20, 100] },
  { title: "Jazz al atardecer (ejemplo)", category: "conciertos", v: "placitaMay", inDays: 9, time: "18:30", free: true },
  { title: "Noche de Trova (ejemplo)", category: "conciertos", v: "perla", inDays: 10, time: "19:30", price: [15, 35] },
  { title: "Festival Gastronómico (ejemplo)", category: "festivales", v: "distrito", inDays: 11, time: "16:00", price: [10, 10] },
  { title: "Baloncesto: clásico regional (ejemplo)", category: "juegos", v: "pachin", inDays: 12, time: "20:00", price: [12, 40] },
  { title: "Comedia: gira isla (ejemplo)", category: "entretenimiento", v: "ruben", inDays: 14, time: "20:00", price: [30, 60] },
  { title: "Concierto de merengue (ejemplo)", category: "conciertos", v: "coliseo", inDays: 17, time: "20:30", price: [45, 180] },
  { title: "Feria familiar de ciencias (ejemplo)", category: "familia", v: "hiram", inDays: 19, time: "10:00", free: true },
  { title: "Rock en español (ejemplo)", category: "conciertos", v: "coca", inDays: 23, time: "21:00", price: [40, 110] },
  { title: "Fiestas patronales (ejemplo)", category: "festivales", v: "placitaMay", inDays: 27, time: "17:00", free: true },
  { title: "Ballet: temporada de otoño (ejemplo)", category: "entretenimiento", v: "bellas", inDays: 32, time: "19:00", price: [25, 70] },
  { title: "Béisbol invernal: juego inaugural (ejemplo)", category: "juegos", v: "hiram", inDays: 40, time: "19:00", price: [10, 35] },
];

const PR_OFFSET_H = 4; // UTC-4, no DST

export function sampleEvents(now = Date.now()): EventItem[] {
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Puerto_Rico" }).format(now);
  const [y, m, d] = today.split("-").map(Number);
  return DEFS.map((e, i) => {
    const [hh, mm] = e.time.split(":").map(Number);
    const start = new Date(Date.UTC(y, m - 1, d + e.inDays, hh + PR_OFFSET_H, mm));
    const day = new Date(Date.UTC(y, m - 1, d + e.inDays)).toISOString().slice(0, 10);
    return {
      id: `sample-${i}`,
      title: e.title,
      category: e.category,
      start: start.toISOString(),
      day,
      ...VENUES[e.v],
      priceMin: e.price?.[0],
      priceMax: e.price?.[1],
      free: e.free,
      description: e.description,
    };
  });
}
