// app/page.tsx — Inicio: "Lo que tienes que saber hoy", as a visual feed.
"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle, ChevronRight, CloudSun, Fuel, ShieldAlert, Ship, Ticket, TrafficCone, Zap,
} from "lucide-react";
import Sponsored from "@/components/ui/Sponsored";
import Artwork, { SECTION_EMOJI } from "@/components/ui/Artwork";
import { Skeleton } from "@/components/ui/Page";
import EventPoster from "@/components/events/EventPoster";
import TeamLogo from "@/components/sports/TeamLogo";
import { useFetchJson } from "@/lib/useFetchJson";
import { useProfile } from "@/lib/profile";
import { useT } from "@/lib/i18n";
import { regionOf, weatherZoneFor } from "@/lib/utilities/municipios";
import { sampleLottery } from "@/lib/utilities/local";
import type { WeatherResponse } from "@/lib/utilities/weather";
import type { OutagesResponse } from "@/lib/utilities/outages";
import type { NewsResponse } from "@/lib/news/types";
import type { EventsResponse } from "@/lib/events/types";
import type { Game, LeagueData } from "@/lib/sports/types";
import { timeAgo } from "@/lib/time";
import { cn } from "@/lib/utils";

const TZ = "America/Puerto_Rico";

function Section({ title, href, children, cta }: { title: string; href?: string; cta?: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between px-4">
        <h2 className="text-xl font-extrabold">{title}</h2>
        {href && (
          <Link href={href} className="text-sm font-semibold text-zinc-400 flex items-center">
            {cta ?? "Ver todo"} <ChevronRight className="w-4 h-4" />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

function Rail({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory px-4 scroll-px-4">{children}</div>
  );
}

function LiveChip({ g }: { g: Game }) {
  const live = g.state === "in";
  return (
    <Link href="/deportes" className="snap-start shrink-0 rounded-2xl bg-zinc-900 px-3 py-2.5 min-w-[172px] pressable">
      <p className={cn("text-[10px] font-bold mb-1.5 flex items-center gap-1", live ? "text-coral" : "text-zinc-500")}>
        {live && <span className="w-1.5 h-1.5 rounded-full bg-coral animate-pulse" />}
        {live ? `EN VIVO · ${g.status}` : g.status} · {g.league.toUpperCase()}
      </p>
      {[g.away, g.home].map((s) => (
        <div key={s.team.id} className="flex items-center gap-2 text-sm">
          <TeamLogo team={s.team} size={18} />
          <span className={cn("font-semibold", g.state === "post" && s.winner === false && "text-zinc-500")}>{s.team.abbr}</span>
          {s.score !== undefined && <span className="ml-auto font-extrabold tabular-nums">{s.score}</span>}
        </div>
      ))}
    </Link>
  );
}

export default function Inicio() {
  const router = useRouter();
  const { t, lang } = useT();
  const profile = useProfile();
  const zone = profile.pueblo ? weatherZoneFor(profile.pueblo) : "San Juan";
  const weather = useFetchJson<WeatherResponse>(`/api/weather?zone=${encodeURIComponent(zone)}`, 15 * 60_000);
  const outages = useFetchJson<OutagesResponse>("/api/outages", 5 * 60_000);
  const news = useFetchJson<NewsResponse>("/api/news", 5 * 60_000);
  const events = useFetchJson<EventsResponse>("/api/events");
  const today = useMemo(() => new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date()), []);
  const key = today.replace(/-/g, "");
  const bsn = useFetchJson<LeagueData>(`/api/sports?league=bsn&date=${key}`, 120_000);
  const mlb = useFetchJson<LeagueData>(`/api/sports?league=mlb&date=${key}`, 120_000);

  const hour = Number(new Intl.DateTimeFormat("en-US", { timeZone: TZ, hour: "numeric", hour12: false }).format(new Date()));
  const greeting = t(hour < 12 ? "home.greeting.morning" : hour < 19 ? "home.greeting.afternoon" : "home.greeting.night");
  const rawDate = new Date().toLocaleDateString(lang === "en" ? "en-US" : "es-PR", { weekday: "long", day: "numeric", month: "long", timeZone: TZ });
  const dateLabel = rawDate.charAt(0).toUpperCase() + rawDate.slice(1);

  const now = weather.data?.forecast[0];
  const alert = weather.data?.alerts[0];
  const myRegion = profile.pueblo ? regionOf(profile.pueblo) : null;
  const power = outages.data?.power ?? [];
  const mine = power.find((r) => r.region === myRegion);
  const islandPct = power.length ? (power.reduce((s, r) => s + r.without, 0) / power.reduce((s, r) => s + r.clients, 0)) * 100 : null;

  const headlines = useMemo(() => {
    const items = news.data?.items ?? [];
    if (!profile.diaspora) return items.slice(0, 6);
    const d = items.filter((n) => n.section === "Diáspora").slice(0, 2);
    return [...d, ...items.filter((n) => !d.includes(n))].slice(0, 6);
  }, [news.data, profile.diaspora]);

  const upcoming = useMemo(() => {
    const end = new Date(Date.parse(`${today}T16:00:00Z`) + 7 * 86400000).toISOString().slice(0, 10);
    return (events.data?.events ?? [])
      .filter((e) => e.day >= today && e.day <= end && (profile.diaspora || !e.diaspora))
      .sort((a, b) => a.start.localeCompare(b.start))
      .slice(0, 8);
  }, [events.data, today, profile.diaspora]);

  const games = useMemo(() => {
    const all = [...(mlb.data?.games ?? []), ...(bsn.data?.games ?? [])];
    const fav = (g: Game) =>
      profile.teams.includes(`${g.league}:${g.home.team.id}`) || profile.teams.includes(`${g.league}:${g.away.team.id}`);
    const rank = (g: Game) => (fav(g) ? 0 : g.state === "in" ? 1 : g.state === "pre" ? 2 : 3);
    return all.sort((a, b) => rank(a) - rank(b)).slice(0, 8);
  }, [mlb.data, bsn.data, profile.teams]);

  const lotto = sampleLottery(today);
  const quick = [
    { href: "/utilidades/luz", icon: Zap, label: t("util.power"), from: "#f59e0b", to: "#ef4444" },
    { href: "/utilidades/clima", icon: CloudSun, label: t("util.weather"), from: "#38bdf8", to: "#1d4ed8" },
    { href: "/utilidades/trafico", icon: TrafficCone, label: t("util.traffic"), from: "#fb923c", to: "#c2410c" },
    { href: "/utilidades/loteria", icon: Ticket, label: t("util.lottery"), from: "#e879f9", to: "#7c3aed" },
    { href: "/utilidades/gasolina", icon: Fuel, label: t("util.gas"), from: "#34d399", to: "#047857" },
    { href: "/utilidades/lanchas", icon: Ship, label: t("util.ferry"), from: "#22d3ee", to: "#0e7490" },
    { href: "/utilidades/emergencia", icon: ShieldAlert, label: t("util.emergency"), from: "#f87171", to: "#991b1b" },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 pb-32">
      <div className="max-w-md mx-auto space-y-7 pt-4">
        {/* Greeting */}
        <div className="px-4">
          <p className="text-sm text-zinc-500">{dateLabel}</p>
          <h1 className="text-[30px] font-extrabold leading-tight">
            {greeting}
            {profile.username !== "tuusuario" ? `, ${profile.username}` : ""}! <span className="inline-block">👋</span>
          </h1>
          <p className="text-zinc-400">{t("home.today")}</p>
        </div>

        {/* Story-style shortcuts */}
        <div className="flex gap-4 overflow-x-auto scrollbar-hide px-4">
          {quick.map(({ href, icon: Icon, label, from, to }) => (
            <Link key={href} href={href} className="shrink-0 flex flex-col items-center gap-1.5 w-16 pressable">
              <span className="p-[2.5px] rounded-full" style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}>
                <span className="block p-[3px] rounded-full bg-zinc-950">
                  <span
                    className="w-14 h-14 rounded-full flex items-center justify-center text-white"
                    style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
                  >
                    <Icon className="w-6 h-6" />
                  </span>
                </span>
              </span>
              <span className="text-[11px] font-medium text-zinc-300 truncate w-full text-center">{label}</span>
            </Link>
          ))}
        </div>

        {alert && (
          <Link href="/utilidades/clima" className="mx-4 flex gap-3 rounded-[24px] p-4 bg-red-500/15 pressable">
            <AlertTriangle className="w-5 h-5 shrink-0 text-red-400" />
            <div className="min-w-0">
              <p className="font-bold text-sm text-red-300 light:text-red-600">{alert.event}</p>
              <p className="text-xs text-zinc-400 line-clamp-2">{alert.headline}</p>
            </div>
          </Link>
        )}

        {/* Widgets */}
        <div className="grid grid-cols-2 gap-3 px-4">
          <Link href="/utilidades/clima" className="relative rounded-[24px] p-4 overflow-hidden text-white min-h-[132px] pressable">
            <div className="absolute inset-0 bg-gradient-to-br from-sky-400 via-ocean to-indigo-700" />
            <div className="relative">
              <p className="text-xs font-semibold opacity-90 flex items-center gap-1"><CloudSun className="w-4 h-4" /> {zone}</p>
              {now ? (
                <>
                  <p className="text-[40px] font-extrabold leading-none mt-2">{now.temp}°</p>
                  <p className="text-xs opacity-90 mt-1 line-clamp-2">{now.short}</p>
                </>
              ) : (
                <p className="text-sm mt-3 opacity-90">{weather.data ? "Pronóstico no disponible" : "Cargando…"}</p>
              )}
            </div>
          </Link>
          <Link href="/utilidades/luz" className="relative rounded-[24px] p-4 overflow-hidden bg-zinc-900 min-h-[132px] pressable">
            <p className="text-xs font-semibold text-zinc-400 flex items-center gap-1"><Zap className="w-4 h-4 text-yellow-400" /> {t("util.power")}</p>
            {mine ? (
              <>
                <p className="text-lg font-extrabold mt-2 leading-tight">
                  {mine.without / mine.clients > 0.02 ? "Se fue la luz en partes de tu área" : "Tu área tiene luz ✅"}
                </p>
                <p className="text-[11px] text-zinc-500 mt-1">{((mine.without / mine.clients) * 100).toFixed(1)}% sin servicio</p>
              </>
            ) : islandPct !== null ? (
              <>
                <p className="text-[40px] font-extrabold leading-none mt-2">{islandPct.toFixed(1)}%</p>
                <p className="text-[11px] text-zinc-500 mt-1">de la isla sin luz</p>
              </>
            ) : (
              <p className="text-sm mt-3 text-zinc-500">Cargando…</p>
            )}
            {outages.data?.powerSample && (
              <span className="absolute top-3 right-3 text-[9px] font-bold uppercase tracking-wide text-yellow-400">{t("common.sample")}</span>
            )}
          </Link>
        </div>

        {/* Live scores */}
        {games.length > 0 && (
          <Section title={t("home.games")} href="/deportes">
            <Rail>
              {games.map((g) => (
                <LiveChip key={g.id} g={g} />
              ))}
            </Rail>
          </Section>
        )}

        {/* Events carousel */}
        <Section title={lang === "en" ? "This week in PR" : "Esta semana en PR"} href="/eventos">
          {!events.data ? (
            <div className="px-4"><Skeleton className="h-72 rounded-[24px]" /></div>
          ) : upcoming.length === 0 ? (
            <p className="px-4 text-sm text-zinc-500">No hay eventos esta semana.</p>
          ) : (
            <Rail>
              {upcoming.map((e) => (
                <div key={e.id} className="snap-start shrink-0 w-[68%]">
                  <EventPoster e={e} compact onOpen={() => router.push("/eventos")} />
                </div>
              ))}
            </Rail>
          )}
        </Section>

        {/* Headlines */}
        <Section title={t("home.headlines")} href="/noticias">
          {!news.data ? (
            <div className="px-4"><Skeleton className="h-64 rounded-[24px]" /></div>
          ) : (
            <div className="px-4 space-y-3">
              {headlines[0] && (
                <a href={headlines[0].link} target="_blank" rel="noopener noreferrer" className="block relative rounded-[24px] overflow-hidden aspect-[16/10] pressable">
                  <Artwork seed={headlines[0].id} kind={headlines[0].section} emoji={SECTION_EMOJI[headlines[0].section]} image={headlines[0].image} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-coral">{headlines[0].section} · {headlines[0].sourceName}</p>
                    <h3 className="mt-1 text-xl font-extrabold leading-tight line-clamp-3">{headlines[0].title}</h3>
                    <p className="text-xs opacity-80 mt-1">{timeAgo(headlines[0].publishedAt)}</p>
                  </div>
                </a>
              )}
              {headlines.slice(1).map((n) => (
                <a key={n.id} href={n.link} target="_blank" rel="noopener noreferrer" className="flex gap-3 items-center pressable">
                  <div className="relative w-20 h-20 rounded-2xl overflow-hidden shrink-0">
                    <Artwork seed={n.id} kind={n.section} emoji={SECTION_EMOJI[n.section]} image={n.image} className="[&>span]:text-[56px] [&>span]:-right-2 [&>span]:-bottom-3" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold text-zinc-500">
                      {n.sourceName} · {timeAgo(n.publishedAt)}
                      {n.section !== "Local" && <span className="text-coral"> · {n.section}</span>}
                    </p>
                    <p className="text-[15px] font-bold leading-snug line-clamp-3">{n.title}</p>
                  </div>
                </a>
              ))}
            </div>
          )}
        </Section>

        {/* Lottery */}
        <div className="px-4">
          <Link href="/utilidades/loteria" className="block rounded-[24px] bg-zinc-900 p-4 pressable">
            <div className="flex items-center justify-between">
              <p className="font-extrabold">{t("util.lottery")}</p>
              <span className="text-[10px] font-bold uppercase tracking-wide text-yellow-400">{t("common.sample")}</span>
            </div>
            <div className="mt-3 flex items-center gap-2">
              {lotto.loto.numbers.map((n) => (
                <span key={n} className="w-9 h-9 rounded-full bg-zinc-800 font-bold flex items-center justify-center tabular-nums">{n}</span>
              ))}
              <span className="w-9 h-9 rounded-full bg-accent-gradient text-white font-bold flex items-center justify-center">{lotto.loto.plus}</span>
            </div>
            <p className="mt-2 text-xs text-zinc-500">Loto Plus · Pega 3 noche: <span className="font-bold text-zinc-300 tracking-widest">{lotto.pega[1].draws[1].n.join("")}</span></p>
          </Link>
        </div>

        <div className="px-4">
          <Sponsored placement="inicio" />
        </div>
      </div>
    </div>
  );
}
