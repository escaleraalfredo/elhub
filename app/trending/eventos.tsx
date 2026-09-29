// app/trending/eventos.tsx
"use client";

import { Fragment, useMemo, useRef, useState } from "react";
import {
  CalendarDays, CalendarPlus, Check, ExternalLink, MapPin, Search, Share2, Star, X,
} from "lucide-react";
import { toast } from "sonner";
import { Card, EmptyState, Notice, Skeleton } from "@/components/ui/Page";
import SafeImg from "@/components/ui/SafeImg";
import Sponsored from "@/components/ui/Sponsored";
import { CommentButton, CommentsSheet } from "@/components/comments/Comments";
import { EVENT_CATEGORIES, type EventCategory, type EventItem, type EventsResponse } from "@/lib/events/types";
import { downloadIcs, toggleEvent, useEventLists } from "@/lib/events/store";
import { useFetchJson } from "@/lib/useFetchJson";
import { award } from "@/lib/points";
import { cn } from "@/lib/utils";

const TZ = "America/Puerto_Rico";
type When = "todo" | "hoy" | "manana" | "finde" | "semana" | "mes" | "fecha";

const WHEN: { id: Exclude<When, "fecha">; label: string }[] = [
  { id: "todo", label: "Todo" },
  { id: "hoy", label: "Hoy" },
  { id: "manana", label: "Mañana" },
  { id: "finde", label: "Este finde" },
  { id: "semana", label: "7 días" },
  { id: "mes", label: "30 días" },
];

const dayKey = (d: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(d);
const addDays = (key: string, n: number) => {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
};
const keyDate = (key: string) => new Date(`${key}T16:00:00Z`);

function range(when: When, today: string, picked: string | null): [string, string] | null {
  switch (when) {
    case "hoy":
      return [today, today];
    case "manana":
      return [addDays(today, 1), addDays(today, 1)];
    case "finde": {
      // Friday–Sunday of this week; if we're already in the weekend, from today.
      const dow = keyDate(today).getUTCDay(); // 0 Sun .. 6 Sat
      if (dow === 0) return [today, today];
      if (dow === 6) return [today, addDays(today, 1)];
      const fri = addDays(today, 5 - dow);
      return [dow === 5 ? today : fri, addDays(fri, 2)];
    }
    case "semana":
      return [today, addDays(today, 6)];
    case "mes":
      return [today, addDays(today, 30)];
    case "fecha":
      return picked ? [picked, picked] : null;
    default:
      return null;
  }
}

function dayLabel(key: string, today: string) {
  const long = keyDate(key).toLocaleDateString("es-PR", { weekday: "long", day: "numeric", month: "long", timeZone: TZ });
  if (key === today) return `Hoy · ${long}`;
  if (key === addDays(today, 1)) return `Mañana · ${long}`;
  return long.charAt(0).toUpperCase() + long.slice(1);
}

function price(e: EventItem) {
  if (e.free) return "Gratis";
  if (e.priceMin === undefined) return null;
  return e.priceMax && e.priceMax !== e.priceMin ? `$${Math.round(e.priceMin)} – $${Math.round(e.priceMax)}` : `$${Math.round(e.priceMin)}`;
}

const time = (e: EventItem) =>
  new Date(e.start).toLocaleTimeString("es-PR", { hour: "numeric", minute: "2-digit", timeZone: TZ });

const catMeta = (id: EventCategory) => EVENT_CATEGORIES.find((c) => c.id === id)!;

function EventCard({ e, onOpen }: { e: EventItem; onOpen: () => void }) {
  const lists = useEventLists();
  const saved = !!lists.saved[e.id];
  const going = !!lists.going[e.id];
  const d = keyDate(e.day);
  const p = price(e);

  const share = async () => {
    const text = `${e.title} · ${e.venue}, ${e.city}`;
    try {
      if (navigator.share) await navigator.share({ title: e.title, text, url: e.url ?? window.location.href });
      else {
        await navigator.clipboard.writeText(`${text} ${e.url ?? ""}`.trim());
        toast.success("Copiado");
      }
      award("share", { key: `event:${e.id}` });
    } catch {
      // cancelled
    }
  };

  return (
    <Card>
      <button onClick={onOpen} className="w-full text-left flex gap-3 p-3">
        <div className="w-14 shrink-0 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col items-center justify-center py-2">
          <span className="text-[10px] font-bold uppercase text-pr-red">
            {d.toLocaleDateString("es-PR", { month: "short", timeZone: TZ }).replace(".", "")}
          </span>
          <span className="text-2xl font-bold leading-none tabular-nums">{d.getUTCDate()}</span>
          <span className="text-[10px] text-zinc-500 uppercase">
            {d.toLocaleDateString("es-PR", { weekday: "short", timeZone: TZ }).replace(".", "")}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-[11px] text-zinc-400">
            <span>{catMeta(e.category).emoji} {catMeta(e.category).label}</span>
            <span>· {time(e)}</span>
          </div>
          <h3 className="mt-0.5 font-semibold text-[15px] leading-snug text-white line-clamp-2">{e.title}</h3>
          <p className="mt-1 flex items-center gap-1 text-xs text-zinc-400 truncate">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{e.venue} · {e.city}</span>
          </p>
          {p && <p className={cn("mt-1 text-xs font-semibold", e.free ? "text-emerald-400" : "text-zinc-200")}>{p}</p>}
        </div>
        <SafeImg src={e.image} alt="" className="w-16 h-16 rounded-2xl object-cover shrink-0 self-center" />
      </button>
      <div className="flex items-center gap-1 px-2 pb-2 text-xs font-semibold">
        <button
          onClick={() => {
            if (toggleEvent("saved", e)) {
              award("save_event", { key: e.id });
              toast.success("Guardado en tus eventos");
            }
          }}
          className={cn("flex items-center gap-1.5 px-3 py-2 rounded-full", saved ? "text-yellow-400 bg-yellow-400/10" : "text-zinc-400 hover:bg-zinc-800")}
        >
          <Star className={cn("w-4 h-4", saved && "fill-current")} /> {saved ? "Guardado" : "Guardar"}
        </button>
        <button
          onClick={() => {
            if (toggleEvent("going", e)) award("going_event", { key: e.id });
          }}
          className={cn("flex items-center gap-1.5 px-3 py-2 rounded-full", going ? "text-emerald-400 bg-emerald-400/10" : "text-zinc-400 hover:bg-zinc-800")}
        >
          <Check className="w-4 h-4" /> Voy
        </button>
        <button onClick={() => downloadIcs(e)} aria-label="Añadir al calendario" className="p-2 rounded-full text-zinc-400 hover:bg-zinc-800">
          <CalendarPlus className="w-4 h-4" />
        </button>
        <button onClick={share} aria-label="Compartir" className="p-2 rounded-full text-zinc-400 hover:bg-zinc-800">
          <Share2 className="w-4 h-4" />
        </button>
        <CommentButton threadId={`event:${e.id}`} onClick={onOpen} className="ml-auto px-2 [&_svg]:w-4 [&_svg]:h-4 [&_span]:text-xs" />
      </div>
    </Card>
  );
}

function EventDetails({ e }: { e: EventItem }) {
  const p = price(e);
  const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${e.venue}, ${e.city}, Puerto Rico`)}`;
  return (
    <div className="p-4 space-y-3">
      <SafeImg src={e.image} alt="" className="w-full aspect-[16/9] object-cover rounded-2xl" />
      <div>
        <p className="text-xs text-zinc-400">{catMeta(e.category).emoji} {catMeta(e.category).label}</p>
        <h3 className="text-lg font-bold leading-snug">{e.title}</h3>
      </div>
      <div className="space-y-1.5 text-sm text-zinc-300">
        <p className="flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-zinc-500" />
          {keyDate(e.day).toLocaleDateString("es-PR", { weekday: "long", day: "numeric", month: "long", timeZone: TZ })} · {time(e)}
        </p>
        <a href={maps} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white">
          <MapPin className="w-4 h-4 text-zinc-500" /> {e.venue}, {e.city} <span className="text-sky-400 text-xs">Ver mapa</span>
        </a>
        {p && <p className="pl-6 font-semibold">{p}</p>}
      </div>
      {e.description && <p className="text-sm text-zinc-400">{e.description}</p>}
      <div className="flex gap-2">
        {e.url && (
          <a
            href={e.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 bg-pr-red hover:bg-red-600 rounded-2xl py-3 font-semibold text-sm"
          >
            Boletos <ExternalLink className="w-4 h-4" />
          </a>
        )}
        <button
          onClick={() => downloadIcs(e)}
          className="flex-1 flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 rounded-2xl py-3 font-semibold text-sm"
        >
          <CalendarPlus className="w-4 h-4" /> Calendario
        </button>
      </div>
    </div>
  );
}

export default function Eventos() {
  const { data, loading } = useFetchJson<EventsResponse>("/api/events");
  const lists = useEventLists();
  const today = useMemo(() => dayKey(new Date()), []);
  const dateInput = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState("");
  const [when, setWhen] = useState<When>("todo");
  const [picked, setPicked] = useState<string | null>(null);
  const [cat, setCat] = useState<EventCategory | "todo">("todo");
  const [city, setCity] = useState("Toda la isla");
  const [freeOnly, setFreeOnly] = useState(false);
  const [savedOnly, setSavedOnly] = useState(false);
  const [open, setOpen] = useState<EventItem | null>(null);

  const cities = useMemo(
    () => ["Toda la isla", ...Array.from(new Set((data?.events ?? []).map((e) => e.city))).sort()],
    [data]
  );

  const filtered = useMemo(() => {
    const r = range(when, today, picked);
    const q = query.trim().toLowerCase();
    return (data?.events ?? [])
      .filter((e) => e.day >= today)
      .filter((e) => !r || (e.day >= r[0] && e.day <= r[1]))
      .filter((e) => cat === "todo" || e.category === cat)
      .filter((e) => city === "Toda la isla" || e.city === city)
      .filter((e) => !freeOnly || e.free)
      .filter((e) => !savedOnly || lists.saved[e.id] || lists.going[e.id])
      .filter((e) => !q || `${e.title} ${e.venue} ${e.city}`.toLowerCase().includes(q))
      .sort((a, b) => a.start.localeCompare(b.start));
  }, [data, when, picked, today, query, cat, city, freeOnly, savedOnly, lists]);

  const groups = useMemo(() => {
    const m = new Map<string, EventItem[]>();
    filtered.forEach((e) => m.set(e.day, [...(m.get(e.day) ?? []), e]));
    return [...m.entries()];
  }, [filtered]);

  const activeFilters = (when !== "todo" ? 1 : 0) + (cat !== "todo" ? 1 : 0) + (city !== "Toda la isla" ? 1 : 0) + (freeOnly ? 1 : 0) + (savedOnly ? 1 : 0) + (query ? 1 : 0);
  const clear = () => {
    setQuery("");
    setWhen("todo");
    setPicked(null);
    setCat("todo");
    setCity("Toda la isla");
    setFreeOnly(false);
    setSavedOnly(false);
  };

  const chip = (active: boolean) =>
    cn(
      "shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
      active ? "bg-pr-red text-white" : "bg-zinc-900 text-zinc-300 border border-zinc-800 hover:bg-zinc-800"
    );

  let shown = 0;

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-2xl px-3.5 py-2.5 focus-within:border-zinc-600">
        <Search className="w-4 h-4 text-zinc-500" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Busca artista, lugar o pueblo"
          className="flex-1 bg-transparent text-[15px] placeholder-zinc-500 focus:outline-none"
        />
        {query && (
          <button onClick={() => setQuery("")} aria-label="Borrar búsqueda" className="text-zinc-500">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* When */}
      <div className="-mx-4 flex gap-2 overflow-x-auto scrollbar-hide px-4">
        {WHEN.map((w) => (
          <button key={w.id} onClick={() => { setWhen(w.id); setPicked(null); }} className={chip(when === w.id)}>
            {w.label}
          </button>
        ))}
        <button
          onClick={() => {
            const el = dateInput.current;
            if (!el) return;
            if (typeof el.showPicker === "function") el.showPicker();
            else el.click();
          }}
          className={cn(chip(when === "fecha"), "flex items-center gap-1.5")}
        >
          <CalendarDays className="w-4 h-4" />
          {when === "fecha" && picked
            ? keyDate(picked).toLocaleDateString("es-PR", { day: "numeric", month: "short", timeZone: TZ })
            : "Elegir fecha"}
        </button>
        <input
          ref={dateInput}
          type="date"
          min={today}
          value={picked ?? ""}
          onChange={(e) => {
            if (e.target.value) {
              setPicked(e.target.value);
              setWhen("fecha");
            }
          }}
          className="sr-only"
          aria-label="Elegir fecha"
        />
      </div>

      {/* Category */}
      <div className="-mx-4 flex gap-2 overflow-x-auto scrollbar-hide px-4">
        <button onClick={() => setCat("todo")} className={chip(cat === "todo")}>Todo</button>
        {EVENT_CATEGORIES.map((c) => (
          <button key={c.id} onClick={() => setCat(c.id)} className={chip(cat === c.id)}>
            {c.emoji} {c.label}
          </button>
        ))}
      </div>

      {/* Where / extras */}
      <div className="flex items-center gap-2">
        <label className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded-full pl-3 pr-2 py-1.5 text-sm">
          <MapPin className="w-4 h-4 text-zinc-500" />
          <select value={city} onChange={(e) => setCity(e.target.value)} className="bg-transparent focus:outline-none text-zinc-200">
            {cities.map((c) => (
              <option key={c} value={c} className="bg-zinc-900">{c}</option>
            ))}
          </select>
        </label>
        <button onClick={() => setFreeOnly(!freeOnly)} className={chip(freeOnly)}>Gratis</button>
        <button onClick={() => setSavedOnly(!savedOnly)} className={cn(chip(savedOnly), "flex items-center gap-1")}>
          <Star className="w-3.5 h-3.5" /> Míos
        </button>
      </div>

      <div className="flex items-center justify-between px-1 text-xs text-zinc-500">
        <span>{data ? `${filtered.length} ${filtered.length === 1 ? "evento" : "eventos"}` : "Buscando eventos..."}</span>
        {activeFilters > 0 && (
          <button onClick={clear} className="font-semibold text-pr-red">Borrar filtros</button>
        )}
      </div>

      {data?.sample && (
        <Notice>
          Eventos de ejemplo en lugares reales. Para ver la cartelera real, conecta Ticketmaster (TICKETMASTER_API_KEY) en Vercel.
        </Notice>
      )}

      {loading && !data && (
        <div className="space-y-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      )}

      {data && filtered.length === 0 && (
        <EmptyState icon="🗓️" title="No encontramos eventos" subtitle="Prueba otra fecha, categoría o pueblo." />
      )}

      {groups.map(([day, events]) => (
        <section key={day} className="space-y-3">
          <h2 className="px-1 text-sm font-bold text-zinc-300">{dayLabel(day, today)}</h2>
          {events.map((e) => {
            shown++;
            return (
              <Fragment key={e.id}>
                <EventCard e={e} onOpen={() => setOpen(e)} />
                {shown === 3 && <Sponsored placement="eventos" />}
              </Fragment>
            );
          })}
        </section>
      ))}

      <CommentsSheet
        open={open !== null}
        onClose={() => setOpen(null)}
        threadId={`event:${open?.id ?? ""}`}
        title="Evento"
        header={open && <EventDetails e={open} />}
      />
    </div>
  );
}
