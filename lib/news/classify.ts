// lib/news/classify.ts
// Keyword classifier for news sections and municipio tags.
import { PUEBLOS } from "@/lib/pueblos";

export const SECTIONS = ["Local", "Política", "Economía", "Salud", "Deportes", "Diáspora"] as const;
export type Section = (typeof SECTIONS)[number];

const strip = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "");

const RULES: [Section, RegExp][] = [
  ["Diáspora", /\b(diaspora|orlando|kissimmee|nueva york|new york|filadelfia|philadelphia|pensilvania|nueva jersey|connecticut|massachusetts|chicago|boricuas? en (los )?estados unidos)\b/i],
  ["Deportes", /\b(beisbol|baloncesto|bsn|lbprc|mlb|nba|boxeo|boxeador|voleibol|atleta|olimpic\w*|seleccion nacional|campeonato|jonron|cangrejeros|vaqueros|criollos|gigantes|leones|indios de mayaguez)\b/i],
  ["Salud", /\b(salud|hospital\w*|medic[oa]s?|vacuna\w*|dengue|covid|pacientes?|cancer|enfermedad\w*|clinica\w*|medicaid|plan vital|farmac\w*)\b/i],
  ["Política", /\b(gobernador\w*|legislatura|camara de representantes|senado|senador\w*|representante|alcalde\w*|eleccion\w*|partido|pnp|ppd|pip|mvc|proyecto de ley|fortaleza|comisionad\w*|congreso|junta de supervision|jsf|politic\w*)\b/i],
  ["Economía", /\b(econom\w*|empleos?|desempleo|inflacion|precios?|negocios?|empresas?|bancos?|mercado|inversion\w*|salario\w*|turismo|impuestos?|ivu|presupuesto|comercio|pymes?)\b/i],
];

export function classify(title: string, excerpt = ""): Section {
  const text = strip(`${title} ${excerpt}`).toLowerCase();
  for (const [section, re] of RULES) if (re.test(text)) return section;
  return "Local";
}

// "Florida" (municipio vs. state) and "Arroyo" (common noun) are too ambiguous.
const TOWNS = PUEBLOS.filter((p) => !p.includes("diáspora") && p !== "Florida" && p !== "Arroyo").map((p) => ({
  name: p,
  re: new RegExp(`(^|[^\\p{L}])${strip(p).replace(/ /g, "\\s+")}([^\\p{L}]|$)`, "u"),
}));

/** Municipios mentioned (case-sensitive, so only proper nouns match). */
export function municipiosIn(title: string, excerpt = ""): string[] {
  const text = strip(`${title} ${excerpt}`);
  return TOWNS.filter((t) => t.re.test(text)).map((t) => t.name);
}
