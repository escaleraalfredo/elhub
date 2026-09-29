// lib/x/types.ts
export interface XPost {
  id: string;
  text: string;
  createdAt: string;
  url: string;
  author: { name: string; username: string; avatar?: string; verified?: boolean };
  metrics: { likes: number; replies: number; reposts: number };
  image?: string;
}

export interface XResponse {
  posts: XPost[];
  /** True when X_BEARER_TOKEN is missing or the X API call failed. */
  sample: boolean;
  reason?: string;
  updatedAt: string;
}

/** Puerto Rico accounts shown as quick links and included in the live query. */
export const PR_ACCOUNTS = [
  { username: "NotiCel", name: "NotiCel" },
  { username: "elnuevodia", name: "El Nuevo Día" },
  { username: "ElVoceroPR", name: "El Vocero" },
  { username: "primerahora", name: "Primera Hora" },
  { username: "MetroPR", name: "Metro PR" },
  { username: "TelemundoPR", name: "Telemundo PR" },
  { username: "wapatv", name: "WAPA" },
  { username: "NWSSanJuan", name: "NWS San Juan" },
];
