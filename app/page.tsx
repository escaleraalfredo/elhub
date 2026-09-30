// app/page.tsx — Inicio: "Lo que tienes que saber hoy"
"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  AlertTriangle, ChevronRight, CloudSun, Fuel, Ship, Ticket, TrafficCone, Zap,
} from "lucide-react";
import { Card, PageContent, PageShell, SectionTitle, Skeleton } from "@/components/ui/Page";
import Sponsored from "@/components/ui/Sponsored";
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

function Tile({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <Link href={href} className={cn("block rounded-3xl p-4 border border-zinc-800 bg-zinc-900", className)}>
      {children}
    </Link>
  );
}

function MiniGame({ g }: { g: Game }) {
  const side = (s: Game["home"]) => (
    <div className="flex items-center gap-2 min-w-0">
      <TeamLogo team={s.team} size={20} />
      <span className={cn("text-sm truncate", g.state === "post" && s.winner === false && "text-zinc-500")}>{s.team.short ?? s.team.name}</span>
      {s.score !== undefined && <span className="ml-auto font-bold tabular-nums">{s.score}</span>}
    </div>
  );
  return (
    <div className="p-3 space-y-1.5">
      <p className={cn("text-[11px] font-bold", g.state === "in" ? "text-coral" : "text-zinc-500")}>
        {g.state === "in" ? `EN VIVO · ${g.status}` : g.status}
      </p>
      {side(g.away)}
      {side(g.home)}
    </div>
  );
}

export default function Inicio() {
  const { t, lang } = useT();
  const profile = useProfile();
  const zone = profile.pueblo ? weatherZoneFor(profile.pueblo) : "San Juan";
  const weather = useFetchJson<WeatherResponse>(`/api/weather?zone=${encodeURIComponent(zone)}`, 15 * 60_000);
  const outages = useFetchJson<OutagesResponse>("/api/outages", 5 * 60_000);
  const news = useFetchJson<NewsResponse>("/api/news", 5 * 60_000);
  const events = useFetchJson<EventsResponse>("/api/events");
  const today = useMemo(() => new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date()), []);
  const bsn = useFetchJson<LeagueData>(`/api/sports?league=bsn&date=${today.replace(/-/g, "")}`, 120_000);
  const mlb = useFetchJson<LeagueData>(`/api/sports?league=mlb&date=${today.replace(/-/g, "")}`, 120_000);

  const hour = Number(new Intl.DateTimeFormat("en-US", { timeZone: TZ, hour: "numeric", hour12: false }).format(new Date()));
  const greeting = t(hour < 12 ? "home.greeting.morning" : hour < 19 ? "home.greeting.afternoon" : "home.greeting.night");
  const rawDate = new Date().toLocaleDateString(lang === "en" ? "en-US" : "es-PR", { weekday: "long", day: "numeric", month: "long", timeZone: TZ });
  const dateLabel = rawDate.charAt(0).toUpperCase() + rawDate.slice(1);

  const now = weather.data?.forecast[0];
  const alert = weather.data?.alerts[0];
  const myRegion = profile.pueblo ? regionOf(profile.pueblo) : null;
  const power = outages.data?.power ?? [];
  const mine = power.find((r) => r.region === myRegion);
  const islandPct = power.length
    ? (power.reduce((s, r) => s + r.without, 0) / power.reduce((s, r) => s + r.clients, 0)) * 100
    : null;

  const headlines = useMemo(() => {
    const items = news.data?.items ?? [];
    if (!profile.diaspora) return items.slice(0, 5);
    const d = items.filter((n) => n.section === "Diáspora").slice(0, 2);
    return [...d, ...items.filter((n) => !d.includes(n))].slice(0, 5);
  }, [news.data, profile.diaspora]);

  const weekend = useMemo(() => {
    const dow = new Date(`${today}T16:00:00Z`).getUTCDay();
    const addDays = (n: number) => new Date(Date.parse(`${today}T16:00:00Z`) + n * 86400000).toISOString().slice(0, 10);
    const start = dow === 0 || dow >= 5 ? today : addDays(5 - dow);
    const end = dow === 0 ? today : addDays(7 - dow);
    return (events.data?.events ?? [])
      .filter((e) => e.day >= start && e.day <= end && (profile.diaspora || !e.diaspora))
      .slice(0, 3);
  }, [events.data, today, profile.diaspora]);

  const games = useMemo(() => {
    const all = [...(mlb.data?.games ?? []), ...(bsn.data?.games ?? [])];
    const fav = (g: Game) =>
      profile.teams.includes(`${g.league}:${g.home.team.id}`) || profile.teams.includes(`${g.league}:${g.away.team.id}`);
    const rank = (g: Game) => (fav(g) ? 0 : g.state === "in" ? 1 : g.state === "pre" ? 2 : 3);
    return all.sort((a, b) => rank(a) - rank(b)).slice(0, 4);
  }, [mlb.data, bsn.data, profile.teams]);

  const lotto = sampleLottery(today);

  return (
    <PageShell>
      <PageContent className="space-y-5 pt-5">
        <div>
          <p className="text-sm text-zinc-500">{dateLabel}</p>
          <h1 className="text-2xl font-extrabold leading-tight">
            {greeting}{profile.username !== "tuusuario" ? `, ${profile.username}` : ""}!
          </h1>
          <p className="text-sm text-zinc-400">{t("home.today")}</p>
        </div>

        {alert && (
          <Link href="/utilidades/clima">
            <Card className={cn("p-4 flex gap-3", alert.urgent ? "border-red-500" : "border-amber-400")}>
              <AlertTriangle className={cn("w-5 h-5 shrink-0", alert.urgent ? "text-red-500" : "text-amber-500")} />
              <div className="min-w-0">
                <p className="font-semibold text-sm">{alert.event}</p>
                <p className="text-xs text-zinc-500 line-clamp-2">{alert.headline}</p>
              </div>
            </Card>
          </Link>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Tile href="/utilidades/clima" className="bg-gradient-to-br from-brand to-sky-700 border-0 text-white">
            <p className="text-xs opacity-90 flex items-center gap-1"><CloudSun className="w-4 h-4" /> {zone}</p>
            {now ? (
              <>
                <p className="text-3xl font-display font-extrabold mt-1">{now.temp}°</p>
                <p className="text-xs opacity-90 line-clamp-2">{now.short}</p>
              </>
            ) : (
              <p className="text-sm mt-2 opacity-90">{weather.data ? "Pronóstico no disponible" : "Cargando…"}</p>
            )}
          </Tile>
          <Tile href="/utilidades/luz">
            <p className="text-xs text-zinc-500 flex items-center gap-1"><Zap className="w-4 h-4 text-amber-500" /> {t("util.power")}</p>
            {mine ? (
              <>
                <p className="text-lg font-bold mt-1 leading-tight">
                  {mine.without / mine.clients > 0.02 ? "Se fue la luz en partes de tu área" : "Tu área tiene luz ✅"}
                </p>
                <p className="text-[11px] text-zinc-500">{((mine.without / mine.clients) * 100).toFixed(1)}% sin servicio</p>
              </>
            ) : islandPct !== null ? (
              <>
                <p className="text-3xl font-display font-extrabold mt-1">{islandPct.toFixed(1)}%</p>
                <p className="text-[11px] text-zinc-500">de la isla sin luz</p>
              </>
            ) : (
              <p className="text-sm mt-2 text-zinc-500">Cargando…</p>
            )}
            {outages.data?.powerSample && <p className="text-[10px] text-amber-600 mt-1">{t("common.sample")}</p>}
          </Tile>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {[
            { href: "/utilidades/trafico", icon: TrafficCone, label: t("util.traffic"), color: "text-orange-500" },
            { href: "/utilidades/gasolina", icon: Fuel, label: t("util.gas"), color: "text-palm" },
            { href: "/utilidades/loteria", icon: Ticket, label: t("util.lottery"), color: "text-fuchsia-500" },
            { href: "/utilidades/lanchas", icon: Ship, label: t("util.ferry"), color: "text-cyan-500" },
          ].map(({ href, icon: Icon, label, color }) => (
            <Link key={href} href={href} className="rounded-2xl bg-zinc-900 border border-zinc-800 py-3 flex flex-col items-center gap-1">
              <Icon className={cn("w-5 h-5", color)} />
              <span className="text-[11px] font-medium">{label}</span>
            </Link>
          ))}
        </div>

        <section className="space-y-2">
          <SectionTitle right={<Link href="/noticias" className="text-xs font-semibold text-brand">{t("home.seeAll")}</Link>}>
            {t("home.headlines")}
          </SectionTitle>
          {!news.data ? (
            <Skeleton className="h-48" />
          ) : (
            <Card className="divide-y divide-zinc-800">
              {headlines.map((n, i) => (
                <a key={n.id} href={n.link} target="_blank" rel="noopener noreferrer" className="flex gap-3 p-3.5">
                  <span className="font-display font-extrabold text-lg text-brand w-5 shrink-0">{i + 1}</span>
                  <div className="min-w-0">
                    <p className="text-[15px] font-semibold leading-snug line-clamp-2">{n.title}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {n.sourceName} · {timeAgo(n.publishedAt)}
                      {n.section !== "Local" && <span className="text-coral"> · {n.section}</span>}
                    </p>
                  </div>
                </a>
              ))}
            </Card>
          )}
        </section>

        <section className="space-y-2">
          <SectionTitle right={<Link href="/deportes" className="text-xs font-semibold text-brand">{t("home.seeAll")}</Link>}>
            {t("home.games")}
          </SectionTitle>
          {games.length === 0 ? (
            <Card className="p-4 text-sm text-zinc-500">{mlb.data || bsn.data ? "No hay juegos hoy." : "Cargando…"}</Card>
          ) : (
            <Card className="grid grid-cols-2 divide-x divide-y divide-zinc-800">
              {games.map((g) => (
                <Link key={g.id} href="/deportes">
                  <MiniGame g={g} />
                </Link>
              ))}
            </Card>
          )}
        </section>

        <section className="space-y-2">
          <SectionTitle right={<Link href="/eventos" className="text-xs font-semibold text-brand">{t("home.seeAll")}</Link>}>
            {t("home.weekend")}
          </SectionTitle>
          {weekend.length === 0 ? (
            <Card className="p-4 text-sm text-zinc-500">{events.data ? "No hay eventos este finde." : "Cargando…"}</Card>
          ) : (
            <Card className="divide-y divide-zinc-800">
              {weekend.map((e) => (
                <Link key={e.id} href="/eventos" className="flex items-center gap-3 p-3.5">
                  <div className="w-11 shrink-0 text-center">
                    <p className="text-[10px] font-bold uppercase text-coral">
                      {new Date(`${e.day}T16:00:00Z`).toLocaleDateString("es-PR", { weekday: "short", timeZone: TZ }).replace(".", "")}
                    </p>
                    <p className="text-lg font-bold leading-none">{Number(e.day.slice(8))}</p>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate">{e.title}</p>
                    <p className="text-xs text-zinc-500 truncate">{e.venue} · {e.city}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-500" />
                </Link>
              ))}
            </Card>
          )}
        </section>

        <Link href="/utilidades/loteria" className="block">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold">{t("util.lottery")}</p>
              <span className="text-[10px] text-amber-600 font-semibold">{t("common.sample")}</span>
            </div>
            <div className="mt-2 flex items-center gap-4 text-sm">
              <span className="text-zinc-500">Pega 3 noche</span>
              <span className="font-bold tabular-nums tracking-widest">{lotto.pega[1].draws[1].n.join("")}</span>
              <span className="text-zinc-500 ml-auto">Loto</span>
              <span className="font-bold tabular-nums">{lotto.loto.numbers.join("-")}</span>
            </div>
          </Card>
        </Link>

        <Sponsored placement="inicio" />
      </PageContent>
    </PageShell>
  );
}
