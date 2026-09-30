// lib/i18n.ts
// Spanish first, English for the diaspora. Covers the app's navigation and
// interface; news and user content stay in their original language.
"use client";

import { useProfile, type Lang } from "./profile";

const DICT = {
  "nav.home": { es: "Inicio", en: "Home" },
  "nav.news": { es: "Noticias", en: "News" },
  "nav.sports": { es: "Deportes", en: "Sports" },
  "nav.events": { es: "Eventos", en: "Events" },
  "nav.more": { es: "Más", en: "More" },

  "home.greeting.morning": { es: "¡Buenos días", en: "Good morning" },
  "home.greeting.afternoon": { es: "¡Buenas tardes", en: "Good afternoon" },
  "home.greeting.night": { es: "¡Buenas noches", en: "Good evening" },
  "home.today": { es: "Lo que tienes que saber hoy", en: "What you need to know today" },
  "home.headlines": { es: "Titulares", en: "Headlines" },
  "home.utilities": { es: "Servicios", en: "Services" },
  "home.weekend": { es: "Este finde", en: "This weekend" },
  "home.games": { es: "Deportes hoy", en: "Sports today" },
  "home.seeAll": { es: "Ver todo", en: "See all" },
  "home.diaspora": { es: "Desde afuera", en: "From abroad" },

  "util.power": { es: "Luz y agua", en: "Power & water" },
  "util.weather": { es: "Clima", en: "Weather" },
  "util.traffic": { es: "Tráfico", en: "Traffic" },
  "util.gas": { es: "Gasolina", en: "Gas prices" },
  "util.lottery": { es: "Lotería", en: "Lottery" },
  "util.ferry": { es: "Lanchas", en: "Ferries" },
  "util.emergency": { es: "Emergencias", en: "Emergencies" },

  "more.title": { es: "Más", en: "More" },
  "more.community": { es: "Comunidad", en: "Community" },
  "more.culture": { es: "Cultura y comida", en: "Culture & food" },
  "more.spots": { es: "Spots", en: "Spots" },
  "more.profile": { es: "Mi perfil", en: "My profile" },
  "more.settings": { es: "Configuración", en: "Settings" },
  "more.login": { es: "Entrar o crear cuenta", en: "Sign in or sign up" },
  "more.language": { es: "Idioma", en: "Language" },
  "more.diasporaMode": { es: "Modo “Desde afuera”", en: "“From abroad” mode" },
  "more.diasporaHint": {
    es: "Noticias de la isla primero y eventos boricuas donde vives.",
    en: "Island news first and Puerto Rican events where you live.",
  },
  "common.sample": { es: "Ejemplo", en: "Sample" },
  "common.share": { es: "Compartir", en: "Share" },
} as const;

export type TKey = keyof typeof DICT;

export function t(key: TKey, lang: Lang) {
  return DICT[key][lang];
}

export function useT() {
  const { lang } = useProfile();
  return { lang, t: (key: TKey) => DICT[key][lang] };
}
