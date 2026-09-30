// lib/events/patronales.ts
// Fiestas patronales and traditional festivals with well-known dates.
// Dates are a reference: each municipio publishes its own program.
import type { EventItem } from "./types";

const FIESTAS: { municipio: string; name: string; month: number; day: number }[] = [
  { municipio: "Juana Díaz", name: "Festival de Reyes", month: 1, day: 6 },
  { municipio: "Mayagüez", name: "Fiestas de la Virgen de la Candelaria", month: 2, day: 2 },
  { municipio: "Bayamón", name: "Fiestas de la Santa Cruz", month: 5, day: 3 },
  { municipio: "Carolina", name: "Fiestas de San Fernando", month: 5, day: 30 },
  { municipio: "Guayama", name: "Fiestas de San Antonio de Padua", month: 6, day: 13 },
  { municipio: "San Juan", name: "Noche de San Juan", month: 6, day: 23 },
  { municipio: "Cataño", name: "Fiestas de la Virgen del Carmen", month: 7, day: 16 },
  { municipio: "Loíza", name: "Fiestas de Santiago Apóstol", month: 7, day: 25 },
  { municipio: "Cabo Rojo", name: "Fiestas de San Miguel Arcángel", month: 9, day: 29 },
  { municipio: "Vega Baja", name: "Fiestas de la Virgen del Rosario", month: 10, day: 7 },
  { municipio: "Ponce", name: "Fiestas de la Virgen de Guadalupe", month: 12, day: 12 },
  { municipio: "Hatillo", name: "Festival de las Máscaras", month: 12, day: 28 },
];

export function patronalesEvents(now = Date.now()): EventItem[] {
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Puerto_Rico" }).format(now);
  const year = +today.slice(0, 4);
  return FIESTAS.map((f, i) => {
    let day = `${year}-${String(f.month).padStart(2, "0")}-${String(f.day).padStart(2, "0")}`;
    if (day < today) day = `${year + 1}${day.slice(4)}`;
    return {
      id: `patronal-${i}`,
      title: `${f.name} · ${f.municipio}`,
      category: "patronales" as const,
      start: new Date(`${day}T18:00:00-04:00`).toISOString(),
      day,
      venue: "Plaza pública",
      city: f.municipio,
      free: true,
      approximate: true,
      description: "Fecha de referencia: confirma el programa oficial con el municipio.",
    };
  });
}
