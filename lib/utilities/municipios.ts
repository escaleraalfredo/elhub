// lib/utilities/municipios.ts
// Each municipio mapped to an (approximate) LUMA service region, which is
// also used as its weather zone.
export type Region = "San Juan" | "Bayamón" | "Carolina" | "Caguas" | "Ponce" | "Mayagüez" | "Arecibo";

export const REGIONS: Record<Region, string[]> = {
  "San Juan": ["San Juan", "Guaynabo"],
  Bayamón: ["Bayamón", "Cataño", "Comerío", "Corozal", "Dorado", "Naranjito", "Orocovis", "Toa Alta", "Toa Baja", "Vega Alta", "Barranquitas"],
  Carolina: ["Carolina", "Canóvanas", "Ceiba", "Culebra", "Fajardo", "Loíza", "Luquillo", "Naguabo", "Río Grande", "Trujillo Alto", "Vieques"],
  Caguas: ["Caguas", "Aguas Buenas", "Aibonito", "Cayey", "Cidra", "Gurabo", "Humacao", "Juncos", "Las Piedras", "Maunabo", "San Lorenzo", "Yabucoa"],
  Ponce: ["Ponce", "Adjuntas", "Arroyo", "Coamo", "Guánica", "Guayama", "Guayanilla", "Jayuya", "Juana Díaz", "Patillas", "Peñuelas", "Salinas", "Santa Isabel", "Villalba", "Yauco"],
  Mayagüez: ["Mayagüez", "Aguada", "Aguadilla", "Añasco", "Cabo Rojo", "Hormigueros", "Isabela", "Lajas", "Las Marías", "Maricao", "Moca", "Rincón", "Sabana Grande", "San Germán", "San Sebastián"],
  Arecibo: ["Arecibo", "Barceloneta", "Camuy", "Ciales", "Florida", "Hatillo", "Lares", "Manatí", "Morovis", "Quebradillas", "Utuado", "Vega Baja"],
};

export const REGION_NAMES = Object.keys(REGIONS) as Region[];

export function regionOf(municipio: string): Region | null {
  for (const r of REGION_NAMES) if (REGIONS[r].includes(municipio)) return r;
  return null;
}

/** Weather zones: region centers plus the islands. */
export const WEATHER_ZONES: Record<string, { lat: number; lon: number }> = {
  "San Juan": { lat: 18.4655, lon: -66.1057 },
  Bayamón: { lat: 18.3985, lon: -66.1557 },
  Carolina: { lat: 18.3808, lon: -65.9574 },
  Caguas: { lat: 18.2341, lon: -66.0485 },
  Ponce: { lat: 18.0111, lon: -66.6141 },
  Mayagüez: { lat: 18.2013, lon: -67.1397 },
  Arecibo: { lat: 18.4725, lon: -66.7157 },
  Vieques: { lat: 18.1263, lon: -65.4401 },
  Culebra: { lat: 18.303, lon: -65.301 },
};

export function weatherZoneFor(municipio: string): string {
  if (municipio === "Vieques" || municipio === "Culebra") return municipio;
  return regionOf(municipio) ?? "San Juan";
}
