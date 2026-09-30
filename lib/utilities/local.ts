// lib/utilities/local.ts
// Reference data with no public feed yet: traffic, gas prices, lottery,
// ferries, emergency checklist. Everything here is shown with an
// "Ejemplo" / "Referencia" label in the UI.
export const HIGHWAYS = [
  { id: "pr22", name: "PR-22 · Expreso José de Diego", span: "San Juan ↔ Hatillo", lat: 18.43, lon: -66.2 },
  { id: "pr52", name: "PR-52 · Expreso Luis A. Ferré", span: "San Juan ↔ Ponce", lat: 18.25, lon: -66.08 },
  { id: "pr18", name: "PR-18 · Expreso Las Américas", span: "Hato Rey ↔ Caguas (PR-52)", lat: 18.4, lon: -66.07 },
  { id: "pr26", name: "PR-26 · Expreso Baldorioty", span: "Condado ↔ Carolina", lat: 18.44, lon: -66.03 },
  { id: "pr66", name: "PR-66 · Autopista Roberto Sánchez Vilella", span: "Carolina ↔ Río Grande", lat: 18.4, lon: -65.9 },
  { id: "pr2", name: "PR-2", span: "Bayamón ↔ Mayagüez (costa norte/oeste)", lat: 18.4, lon: -66.16 },
  { id: "pr30", name: "PR-30", span: "Caguas ↔ Humacao", lat: 18.2, lon: -65.95 },
  { id: "pr53", name: "PR-53", span: "Fajardo ↔ Guayama", lat: 18.1, lon: -65.8 },
];

export type TrafficKind = "Accidente" | "Cierre" | "Construcción" | "Tráfico lento";

export function sampleTraffic(day: string) {
  const items: { id: string; road: string; kind: TrafficKind; where: string; minutes: number }[] = [
    { id: "t1", road: "pr22", kind: "Tráfico lento", where: "Dirección San Juan, desde Toa Baja hasta el peaje de Buchanan", minutes: 25 },
    { id: "t2", road: "pr52", kind: "Construcción", where: "Carril derecho cerrado cerca de Cayey (km 50)", minutes: 10 },
    { id: "t3", road: "pr18", kind: "Accidente", where: "Dirección Caguas, antes de la salida a Río Piedras", minutes: 15 },
    { id: "t4", road: "pr26", kind: "Tráfico lento", where: "Hacia el aeropuerto, a la altura de Isla Verde", minutes: 12 },
    { id: "t5", road: "pr2", kind: "Cierre", where: "Cierre nocturno parcial en Aguadilla por repavimentación", minutes: 0 },
  ];
  const offset = day.charCodeAt(day.length - 1) % items.length;
  return [...items.slice(offset), ...items.slice(0, offset)].slice(0, 4);
}

export const GAS_REGIONS = ["San Juan", "Bayamón", "Carolina", "Caguas", "Ponce", "Mayagüez", "Arecibo"];

/** Sample prices in USD per liter (PR sells gas by the liter). */
export function sampleGas(day: string) {
  let h = 0;
  for (const ch of day) h = (h * 17 + ch.charCodeAt(0)) | 0;
  return GAS_REGIONS.map((region, i) => {
    const d = Math.abs(Math.sin(h + i)) * 0.06;
    const regular = +(0.86 + d).toFixed(3);
    return { region, regular, premium: +(regular + 0.12).toFixed(3), diesel: +(regular + 0.09).toFixed(3) };
  });
}

export const LITERS_PER_GALLON = 3.785;

function digits(seed: string, n: number, max = 10) {
  let h = 0;
  for (const ch of seed) h = (h * 131 + ch.charCodeAt(0)) >>> 0;
  return Array.from({ length: n }, (_, i) => {
    h = (h * 1103515245 + 12345 + i) >>> 0;
    return h % max;
  });
}

export function sampleLottery(day: string) {
  const uniq = (xs: number[]) => Array.from(new Set(xs.map((x) => x + 1))).slice(0, 5).sort((a, b) => a - b);
  return {
    day,
    pega: [
      { game: "Pega 2", draws: [{ when: "Mediodía", n: digits(`${day}p2m`, 2) }, { when: "Noche", n: digits(`${day}p2n`, 2) }] },
      { game: "Pega 3", draws: [{ when: "Mediodía", n: digits(`${day}p3m`, 3) }, { when: "Noche", n: digits(`${day}p3n`, 3) }] },
      { game: "Pega 4", draws: [{ when: "Mediodía", n: digits(`${day}p4m`, 4) }, { when: "Noche", n: digits(`${day}p4n`, 4) }] },
    ],
    loto: {
      game: "Loto Plus",
      numbers: uniq(digits(`${day}loto`, 9, 46)),
      plus: digits(`${day}plus`, 1, 5)[0] + 1,
      revancha: uniq(digits(`${day}rev`, 9, 46)),
    },
  };
}

export const FERRY_ROUTES = [
  {
    id: "vieques",
    name: "Ceiba ↔ Vieques",
    duration: "~45 min",
    toIsland: ["6:30 AM", "9:30 AM", "1:00 PM", "4:30 PM", "8:00 PM"],
    fromIsland: ["4:30 AM", "8:00 AM", "11:00 AM", "3:00 PM", "6:00 PM"],
  },
  {
    id: "culebra",
    name: "Ceiba ↔ Culebra",
    duration: "~45 min–1 h",
    toIsland: ["9:00 AM", "3:00 PM", "7:00 PM"],
    fromIsland: ["6:30 AM", "1:00 PM", "5:00 PM"],
  },
];

export const PREPARATE = [
  { id: "agua", label: "Agua: 1 galón por persona por día, para al menos 7 días" },
  { id: "comida", label: "Comida enlatada y seca para 7 días (y abrelatas manual)" },
  { id: "meds", label: "Medicamentos y recetas para varias semanas" },
  { id: "luz", label: "Linternas, baterías y power banks cargados" },
  { id: "radio", label: "Radio de baterías o de manivela" },
  { id: "docs", label: "Documentos importantes en bolsa plástica sellada" },
  { id: "cash", label: "Efectivo (los ATH/ATM pueden fallar sin luz)" },
  { id: "gas", label: "Tanque del carro lleno y gas para la estufa" },
  { id: "botiquin", label: "Botiquín de primeros auxilios" },
  { id: "mascotas", label: "Comida y agua para mascotas" },
  { id: "plan", label: "Plan familiar: punto de encuentro y refugio más cercano" },
  { id: "generador", label: "Generador revisado — úsalo afuera, nunca dentro de la casa" },
];
