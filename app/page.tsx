// app/page.tsx — Inicio, sports-network style: top stories, "Hoy en PR"
// service tiles, scores, events and headlines.
"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, ChevronRight } from "lucide-react";
import Sponsored from "@/components/ui/Sponsored";
import Artwork, { SECTION_EMOJI } from "@/components/ui/Artwork";
import { Skeleton } from "@/components/ui/Page";
import EventPoster from "@/components/events/EventPoster";
import { useFetchJson } from "@/lib/useFetchJson";
import { useProfile } from "@/lib/profile";
import { useT } from "@/lib/i18n";
import { regionOf, weatherZoneFor } from "@/lib/utilities/municipios";
import { sampleGas, sampleLottery } from "@/lib/utilities/local";
import type { WeatherResponse } from "@/lib/utilities/weather";
import type { OutagesResponse } from "@/lib/utilities/outages";
import type { NewsResponse } from "@/lib/news/types";
import type { EventsResponse } from "@/lib/events/types";
import { timeAgo } from "@/lib/time";
import { cn } from "@/lib/utils";

const TZ = "America/Puerto_Rico";

function Label({ children, href, cta = "Ver todo" }: { children: React.ReactNode; href?: string; cta?: string }) {
  return (
    <div className="flex items-center justify-between px-4">
      <h2 className="label-bar text-[17px]">{children}</h2>
      {href && (
        <Link href={href} className="font-display text-[13px] font-bold uppercase tracking-wide text-zinc-400 flex items-center">
          {cta} <ChevronRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
}

function Tile({ href, label, value, sub, tone, sample }: { href: string; label: string; value: string; sub?: string; tone?: string; sample?: boolean }) {
  return (
    <Link href={href} className="relative rounded-md bg-zinc-900 px-3 py-2.5 pressable min-w-0">
      <p className="text-[11px] font-semibold text-zinc-400 truncate">{label}</p>
      <p className={cn("font-display text-[24px] font-extrabold leading-none mt-1 tabular-nums truncate", tone)}>{value}</p>
      {sub && <p className="text-[10px] text-zinc-500 mt-1 truncate">{sub}</p>}
      {sample && <span className="absolute top-1.5 right-2 text-[8px] font-bold uppercase tracking-wider text-yellow-400">Ej.</span>}
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

  const rawDate = new Date().toLocaleDateString(lang === "en" ? "en-US" : "es-PR", { weekday: "long", day: "numeric", month: "long", timeZone: TZ });

  const now = weather.data?.forecast[0];
  const alert = weather.data?.alerts[0];
  const myRegion = profile.pueblo ? regionOf(profile.pueblo) : null;
  const power = outages.data?.power ?? [];
  const mine = power.find((r) => r.region === myRegion);
  const powerPct = mine
    ? (mine.without / mine.clients) * 100
    : power.length
      ? (power.reduce((s, r) => s + r.without, 0) / power.reduce((s, r) => s + r.clients, 0)) * 100
      : null;
  const gas = sampleGas(today);
  const myGas = gas.find((g) => g.region === (myRegion ?? "San Juan")) ?? gas[0];
  const lotto = sampleLottery(today);

  const headlines = useMemo(() => {
    const items = news.data?.items ?? [];
    if (!profile.diaspora) return items.slice(0, 7);
    const d = items.filter((n) => n.section === "Diáspora").slice(0, 2);
    return [...d, ...items.filter((n) => !d.includes(n))].slice(0, 7);
  }, [news.data, profile.diaspora]);
  const [top, ...rest] = headlines;

  const upcoming = useMemo(() => {
    const end = new Date(Date.parse(`${today}T16:00:00Z`) + 7 * 86400000).toISOString().slice(0, 10);
    return (events.data?.events ?? [])
      .filter((e) => e.day >= today && e.day <= end && (profile.diaspora || !e.diaspora))
      .sort((a, b) => a.start.localeCompare(b.start))
      .slice(0, 8);
  }, [events.data, today, profile.diaspora]);

  return (
    <div className="min-h-screen bg-zinc-950 pb-24">
      <div className="max-w-md mx-auto space-y-6 pt-4">
        <p className="px-4 font-display text-[13px] font-bold uppercase tracking-wider text-zinc-400">
          {rawDate} · {zone}
        </p>

        {alert && (
          <Link href="/utilidades/clima" className="mx-4 flex gap-3 rounded-md p-3 bg-brand/15 border-l-4 border-brand pressable">
            <AlertTriangle className="w-5 h-5 shrink-0 text-brand" />
            <div className="min-w-0">
              <p className="font-display font-bold uppercase tracking-wide text-[15px]">{alert.event}</p>
              <p className="text-xs text-zinc-400 line-clamp-2">{alert.headline}</p>
            </div>
          </Link>
        )}

        {/* Top stories */}
        <section className="space-y-3">
          <Label href="/noticias">Top stories</Label>
          {!news.data ? (
            <div className="px-4"><Skeleton className="h-56 rounded-lg" /></div>
          ) : (
            <div className="px-4 space-y-0">
              {top && (
                <a href={top.link} target="_blank" rel="noopener noreferrer" className="block relative rounded-md overflow-hidden aspect-[16/10] pressable">
                  <Artwork seed={top.id} kind={top.section} emoji={SECTION_EMOJI[top.section]} image={top.image} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-3 text-white">
                    <p className="font-display text-[12px] font-bold uppercase tracking-wider text-brand">{top.section} · {top.sourceName}</p>
                    <h3 className="font-display text-[24px] font-bold leading-[1.05] line-clamp-3">{top.title}</h3>
                    <p className="text-[11px] opacity-75 mt-1">{timeAgo(top.publishedAt)}</p>
                  </div>
                </a>
              )}
              <div className="divide-y divide-zinc-800">
                {rest.slice(0, 4).map((n) => (
                  <a key={n.id} href={n.link} target="_blank" rel="noopener noreferrer" className="flex gap-3 py-3 items-center pressable">
                    <div className="relative w-[72px] h-[50px] rounded-sm overflow-hidden shrink-0">
                      <Artwork seed={n.id} kind={n.section} image={n.image} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[14px] font-semibold leading-snug line-clamp-2">{n.title}</p>
                      <p className="text-[11px] text-zinc-500 mt-0.5">
                        {n.sourceName} · {timeAgo(n.publishedAt)}
                        {n.section !== "Local" && <span className="text-brand"> · {n.section}</span>}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Hoy en PR */}
        <section className="space-y-3">
          <Label href="/mas" cta="Servicios">Hoy en PR</Label>
          <div className="grid grid-cols-3 gap-2 px-4">
            <Tile
              href="/utilidades/luz"
              label="Luz"
              value={powerPct === null ? "—" : `${powerPct.toFixed(1)}%`}
              sub={mine ? `sin luz · ${myRegion}` : "sin luz · isla"}
              tone={powerPct !== null && powerPct >= 5 ? "text-brand" : undefined}
              sample={outages.data?.powerSample}
            />
            <Tile href="/utilidades/clima" label={zone} value={now ? `${now.temp}°` : "—"} sub={now?.short ?? "Clima"} />
            <Tile href="/utilidades/gasolina" label="Gasolina" value={`$${myGas.regular.toFixed(2)}`} sub="regular / litro" sample />
            <Tile href="/utilidades/trafico" label="Tráfico" value="PR-22" sub="ver en vivo" />
            <Tile href="/utilidades/loteria" label="Pega 3" value={lotto.pega[1].draws[1].n.join("")} sub="noche" sample />
            <Tile href="/utilidades/lanchas" label="Lanchas" value="Ceiba" sub="Vieques · Culebra" />
          </div>
        </section>

        {/* Events */}
        <section className="space-y-3">
          <Label href="/eventos">{lang === "en" ? "This week" : "Esta semana"}</Label>
          {!events.data ? (
            <div className="px-4"><Skeleton className="h-64 rounded-lg" /></div>
          ) : upcoming.length === 0 ? (
            <p className="px-4 text-sm text-zinc-500">No hay eventos esta semana.</p>
          ) : (
            <div className="flex gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory px-4 scroll-px-4">
              {upcoming.map((e) => (
                <div key={e.id} className="snap-start shrink-0 w-[62%]">
                  <EventPoster e={e} compact onOpen={() => router.push("/eventos")} />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* More headlines */}
        {rest.length > 4 && (
          <section className="space-y-3">
            <Label href="/noticias">{t("home.headlines")}</Label>
            <div className="px-4 divide-y divide-zinc-800">
              {rest.slice(4).map((n) => (
                <a key={n.id} href={n.link} target="_blank" rel="noopener noreferrer" className="block py-3 pressable">
                  <p className="text-[11px] text-zinc-500">{n.sourceName} · {timeAgo(n.publishedAt)}</p>
                  <p className="text-[15px] font-semibold leading-snug">{n.title}</p>
                </a>
              ))}
            </div>
          </section>
        )}

        <div className="px-4">
          <Sponsored placement="inicio" />
        </div>
      </div>
    </div>
  );
}
