// app/perfil/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarDays, ChevronDown, Flame, MapPin, Settings, Trophy } from "lucide-react";
import { Card, PageContent, PageShell, SectionTitle } from "@/components/ui/Page";
import Avatar from "@/components/ui/Avatar";
import { LEVELS, RULES, usePoints, type Action } from "@/lib/points";
import { PUEBLOS, updateProfile, useProfile } from "@/lib/profile";
import { useEventLists } from "@/lib/events/store";
import { cn } from "@/lib/utils";

// Sample community for the weekly ranking until accounts are connected.
const COMMUNITY = [
  { name: "sanjuanero", weekly: 412, pueblo: "San Juan" },
  { name: "playero_pr", weekly: 368, pueblo: "Luquillo" },
  { name: "bayamonesa", weekly: 301, pueblo: "Bayamón" },
  { name: "ponceño_pa", weekly: 255, pueblo: "Ponce" },
  { name: "mayaguezano", weekly: 198, pueblo: "Mayagüez" },
  { name: "cagueña", weekly: 164, pueblo: "Caguas" },
  { name: "loiceño", weekly: 120, pueblo: "Loíza" },
  { name: "carolinense", weekly: 87, pueblo: "Carolina" },
  { name: "vegabajeño", weekly: 55, pueblo: "Vega Baja" },
  { name: "isabelino", weekly: 30, pueblo: "Isabela" },
];

type Badge = { icon: string; name: string; desc: string; value: number; goal: number };

export default function PerfilPage() {
  const { total, weekly, streak, level, counts } = usePoints();
  const profile = useProfile();
  const events = useEventLists();
  const [showRules, setShowRules] = useState(false);

  const c = (a: Action) => counts[a] ?? 0;

  const ranking = [...COMMUNITY, { name: profile.username, weekly, pueblo: profile.pueblo, me: true }]
    .sort((a, b) => b.weekly - a.weekly)
    .map((u, i) => ({ ...u, rank: i + 1 }));
  const me = ranking.find((u) => "me" in u)!;
  const shown = ranking.filter((u) => u.rank <= 5 || "me" in u);

  const badges: Badge[] = [
    { icon: "💬", name: "Primera palabra", desc: "Publica tu primer comentario", value: c("comment"), goal: 1 },
    { icon: "🗣️", name: "Comentarista", desc: "25 comentarios", value: c("comment"), goal: 25 },
    { icon: "📰", name: "Bien informado", desc: "Lee 50 noticias", value: c("read_news"), goal: 50 },
    { icon: "🎯", name: "Pronosticador", desc: "10 pronósticos", value: c("predict"), goal: 10 },
    { icon: "🦅", name: "Ojo de águila", desc: "10 pronósticos acertados", value: c("correct_pick"), goal: 10 },
    { icon: "🎉", name: "Janguero", desc: "Marca “Voy” en 5 eventos", value: c("going_event"), goal: 5 },
    { icon: "📣", name: "Voz del pueblo", desc: "Crea 3 temas", value: c("create_topic"), goal: 3 },
    { icon: "🗳️", name: "Votante", desc: "Vota en 20 encuestas", value: c("vote_poll"), goal: 20 },
    { icon: "🔥", name: "Racha de 7", desc: "Entra 7 días seguidos", value: streak, goal: 7 },
    { icon: "📍", name: "De mi pueblo", desc: "5 check-ins en pueblos", value: c("checkin_pueblo"), goal: 5 },
  ];
  const unlocked = badges.filter((b) => b.value >= b.goal).length;

  const upcoming = Object.values({ ...events.saved, ...events.going })
    .filter((e, i, arr) => arr.findIndex((x) => x.id === e.id) === i)
    .sort((a, b) => a.start.localeCompare(b.start))
    .slice(0, 3);

  return (
    <PageShell>
      <PageContent className="space-y-5">
        {/* Identity + level */}
        <Card className="p-5">
          <div className="flex items-center gap-4">
            <Avatar name={profile.username} size={64} />
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold truncate">@{profile.username}</h1>
              <p className="text-sm text-emerald-400 font-semibold">
                Nivel {level.level} · {level.title}
              </p>
              <label className="mt-1 inline-flex items-center gap-1 text-xs text-zinc-400">
                <MapPin className="w-3.5 h-3.5" />
                <select
                  value={profile.pueblo}
                  onChange={(e) => updateProfile({ pueblo: e.target.value })}
                  className="bg-transparent focus:outline-none text-zinc-300"
                >
                  <option value="" className="bg-zinc-900">Elige tu pueblo</option>
                  {PUEBLOS.map((p) => (
                    <option key={p} value={p} className="bg-zinc-900">{p}</option>
                  ))}
                </select>
              </label>
            </div>
            <Link href="/settings" aria-label="Configuración" className="p-2 text-zinc-400 hover:text-ink self-start">
              <Settings className="w-5 h-5" />
            </Link>
          </div>

          <div className="mt-5">
            <div className="flex justify-between text-xs text-zinc-400 mb-1.5">
              <span>{total.toLocaleString()} pts</span>
              <span>
                {level.next
                  ? `${(level.next - total).toLocaleString()} pts para ${LEVELS[level.level].title}`
                  : "¡Nivel máximo!"}
              </span>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-palm to-brand transition-all duration-700"
                style={{ width: `${Math.round(level.progress * 100)}%` }}
              />
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2 text-center">
            {[
              { label: "Esta semana", value: `${weekly}`, sub: "pts" },
              { label: "Ranking", value: `#${me.rank}`, sub: "semanal" },
              { label: "Racha", value: `${streak}`, sub: streak === 1 ? "día" : "días", flame: true },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl bg-zinc-800/60 py-3">
                <p className="text-[11px] text-zinc-500">{s.label}</p>
                <p className="text-xl font-bold tabular-nums flex items-center justify-center gap-1">
                  {s.flame && <Flame className="w-4 h-4 text-orange-400" />}
                  {s.value}
                </p>
                <p className="text-[10px] text-zinc-500">{s.sub}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Activity */}
        <section className="space-y-2">
          <SectionTitle>Tu actividad</SectionTitle>
          <Card className="grid grid-cols-3 divide-x divide-zinc-800">
            {[
              { label: "Comentarios", value: c("comment") },
              { label: "Pronósticos", value: c("predict") },
              { label: "Aciertos", value: c("correct_pick") },
            ].map((s) => (
              <div key={s.label} className="py-4 text-center">
                <p className="text-lg font-bold tabular-nums">{s.value}</p>
                <p className="text-[11px] text-zinc-500">{s.label}</p>
              </div>
            ))}
          </Card>
          <Card className="grid grid-cols-3 divide-x divide-zinc-800">
            {[
              { label: "Noticias leídas", value: c("read_news") },
              { label: "Eventos", value: Object.keys(events.saved).length + Object.keys(events.going).length },
              { label: "Temas creados", value: c("create_topic") },
            ].map((s) => (
              <div key={s.label} className="py-4 text-center">
                <p className="text-lg font-bold tabular-nums">{s.value}</p>
                <p className="text-[11px] text-zinc-500">{s.label}</p>
              </div>
            ))}
          </Card>
        </section>

        {/* My events */}
        <section className="space-y-2">
          <SectionTitle right={<Link href="/eventos" className="text-xs font-semibold text-brand">Ver eventos</Link>}>
            Mis próximos eventos
          </SectionTitle>
          {upcoming.length === 0 ? (
            <Card className="p-4 text-sm text-zinc-400">
              Guarda o marca “Voy” en un evento para verlo aquí.
            </Card>
          ) : (
            <Card className="divide-y divide-zinc-800">
              {upcoming.map((e) => (
                <div key={e.id} className="flex items-center gap-3 p-3">
                  <CalendarDays className="w-5 h-5 text-brand shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate">{e.title}</p>
                    <p className="text-xs text-zinc-500 truncate">
                      {new Date(e.start).toLocaleDateString("es-PR", { weekday: "short", day: "numeric", month: "short", timeZone: "America/Puerto_Rico" })}
                      {" · "}{e.venue}
                    </p>
                  </div>
                  {events.going[e.id] && <span className="text-[11px] font-semibold text-emerald-400">Voy</span>}
                </div>
              ))}
            </Card>
          )}
        </section>

        {/* Weekly ranking */}
        <section className="space-y-2">
          <SectionTitle right={<span className="text-xs text-zinc-500">Últimos 7 días</span>}>
            <span className="flex items-center gap-1.5"><Trophy className="w-4 h-4" /> Ranking semanal</span>
          </SectionTitle>
          <Card className="divide-y divide-zinc-800">
            {shown.map((u) => {
              const mine = "me" in u;
              return (
                <div key={u.name + u.rank} className={cn("flex items-center gap-3 px-4 py-3", mine && "bg-brand/10")}>
                  <span
                    className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                      u.rank === 1 ? "bg-yellow-400 text-black" : u.rank === 2 ? "bg-zinc-300 text-black" : u.rank === 3 ? "bg-amber-600" : "bg-zinc-800"
                    )}
                  >
                    {u.rank}
                  </span>
                  <Avatar name={u.name} size={32} />
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm font-semibold truncate", mine && "text-brand")}>{mine ? "Tú" : u.name}</p>
                    {u.pueblo && <p className="text-[11px] text-zinc-500">{u.pueblo}</p>}
                  </div>
                  <span className="text-sm font-bold tabular-nums">{u.weekly} pts</span>
                </div>
              );
            })}
          </Card>
          <p className="px-1 text-[11px] text-zinc-500">
            El ranking usa solo los puntos de los últimos 7 días, así que cualquiera puede subir rápido.
          </p>
        </section>

        {/* Badges */}
        <section className="space-y-2">
          <SectionTitle right={<span className="text-xs text-zinc-500">{unlocked}/{badges.length}</span>}>Logros</SectionTitle>
          <div className="grid grid-cols-2 gap-2">
            {badges.map((b) => {
              const done = b.value >= b.goal;
              return (
                <Card key={b.name} className={cn("p-3", done ? "border-brand/60" : "opacity-80")}>
                  <div className="flex items-center gap-2">
                    <span className={cn("text-2xl", !done && "grayscale")}>{b.icon}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{b.name}</p>
                      <p className="text-[11px] text-zinc-500 leading-tight">{b.desc}</p>
                    </div>
                  </div>
                  <div className="mt-2 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={cn("h-full", done ? "bg-accent-gradient" : "bg-zinc-500")}
                      style={{ width: `${Math.min(100, (b.value / b.goal) * 100)}%` }}
                    />
                  </div>
                  <p className="mt-1 text-[10px] text-zinc-500 tabular-nums">{Math.min(b.value, b.goal)}/{b.goal}</p>
                </Card>
              );
            })}
          </div>
        </section>

        {/* How points work */}
        <section className="space-y-2">
          <Card>
            <button onClick={() => setShowRules(!showRules)} className="w-full flex items-center justify-between p-4 text-left">
              <span className="font-semibold">¿Cómo gano puntos?</span>
              <ChevronDown className={cn("w-5 h-5 text-zinc-400 transition-transform", showRules && "rotate-180")} />
            </button>
            {showRules && (
              <div className="px-4 pb-4 space-y-4">
                <div className="divide-y divide-zinc-800 text-sm">
                  {(Object.keys(RULES) as Action[]).map((a) => (
                    <div key={a} className="flex items-center justify-between py-2 gap-3">
                      <span className="text-zinc-300">{RULES[a].label}</span>
                      <span className="shrink-0 text-right">
                        <span className="font-semibold text-emerald-400">+{RULES[a].points}</span>
                        <span className="block text-[10px] text-zinc-500">máx. {RULES[a].dailyCap}/día</span>
                      </span>
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-sm font-semibold mb-2">Niveles</p>
                  <div className="flex flex-wrap gap-1.5">
                    {LEVELS.map((l, i) => (
                      <span
                        key={l.title}
                        className={cn(
                          "px-2.5 py-1 rounded-full text-[11px] border",
                          i + 1 === level.level ? "border-brand text-ink bg-brand/15" : "border-zinc-800 text-zinc-400"
                        )}
                      >
                        {i + 1}. {l.title} · {l.min.toLocaleString()}
                      </span>
                    ))}
                  </div>
                </div>
                <p className="text-[11px] text-zinc-500">
                  Los límites diarios evitan el spam: lo que más suma es volver cada día, participar y acertar tus pronósticos.
                </p>
              </div>
            )}
          </Card>
        </section>
      </PageContent>
    </PageShell>
  );
}
