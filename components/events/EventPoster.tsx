// components/events/EventPoster.tsx
// Poster-style event card (full-bleed artwork, overlay title, quick actions).
"use client";

import { CalendarPlus, Check, Heart, MapPin } from "lucide-react";
import { toast } from "sonner";
import Artwork from "@/components/ui/Artwork";
import ShareButton from "@/components/ui/ShareButton";
import { CommentButton } from "@/components/comments/Comments";
import { EVENT_CATEGORIES, type EventItem } from "@/lib/events/types";
import { downloadIcs, toggleEvent, useEventLists } from "@/lib/events/store";
import { award } from "@/lib/points";
import { cn } from "@/lib/utils";

const TZ = "America/Puerto_Rico";

export function eventPrice(e: EventItem) {
  if (e.free) return "Gratis";
  if (e.priceMin === undefined) return null;
  return e.priceMax && e.priceMax !== e.priceMin ? `$${Math.round(e.priceMin)}–$${Math.round(e.priceMax)}` : `$${Math.round(e.priceMin)}`;
}

export const eventTime = (e: EventItem) =>
  e.approximate ? "Fecha de referencia" : new Date(e.start).toLocaleTimeString("es-PR", { hour: "numeric", minute: "2-digit", timeZone: TZ });

export function eventDateLabel(e: EventItem) {
  const d = new Date(`${e.day}T16:00:00Z`);
  return d
    .toLocaleDateString("es-PR", { weekday: "short", day: "numeric", month: "short", timeZone: TZ })
    .replace(/\./g, "")
    .toUpperCase();
}

export const catMeta = (id: EventItem["category"]) => EVENT_CATEGORIES.find((c) => c.id === id)!;

export default function EventPoster({
  e,
  onOpen,
  compact = false,
}: {
  e: EventItem;
  onOpen: () => void;
  /** Carousel size: no action row. */
  compact?: boolean;
}) {
  const lists = useEventLists();
  const saved = !!lists.saved[e.id];
  const going = !!lists.going[e.id];
  const price = eventPrice(e);
  const cat = catMeta(e.category);

  const save = (ev: React.MouseEvent) => {
    ev.stopPropagation();
    if (toggleEvent("saved", e)) {
      award("save_event", { key: e.id });
      toast.success("Guardado en tus eventos");
    }
  };

  return (
    <div className="rounded-[24px] overflow-hidden bg-zinc-900">
      <div
        role="button"
        tabIndex={0}
        onClick={onOpen}
        onKeyDown={(ev) => ev.key === "Enter" && onOpen()}
        className={cn("relative block w-full cursor-pointer pressable", compact ? "aspect-[4/5]" : "aspect-[16/11]")}
      >
        <Artwork seed={e.id} kind={e.category} emoji={cat.emoji} image={e.image} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
        <span className="absolute top-3 left-3 glass rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide text-white">
          {eventDateLabel(e)}
        </span>
        <button
          onClick={save}
          aria-label={saved ? "Guardado" : "Guardar"}
          className="absolute top-3 right-3 w-9 h-9 rounded-full glass flex items-center justify-center text-white pressable"
        >
          <Heart className={cn("w-[18px] h-[18px]", saved && "fill-brand text-brand")} />
        </button>
        <div className="absolute inset-x-0 bottom-0 p-4 text-white">
          <p className="text-[11px] font-semibold opacity-90">
            {cat.emoji} {cat.label}
            {price && <span className={cn("ml-2 px-2 py-0.5 rounded-full", e.free ? "bg-palm/90" : "bg-white/20")}>{price}</span>}
          </p>
          <h3 className={cn("mt-1 font-extrabold leading-tight line-clamp-2", compact ? "text-lg" : "text-xl")}>{e.title}</h3>
          <p className="mt-1 flex items-center gap-1 text-xs opacity-85 truncate">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{e.venue} · {e.city}</span>
          </p>
        </div>
      </div>
      {!compact && (
        <div className="flex items-center gap-1 px-3 py-2.5">
          <span className="text-xs text-zinc-400 pl-1">{eventTime(e)}</span>
          <div className="ml-auto flex items-center gap-1">
            <button
              onClick={() => {
                if (toggleEvent("going", e)) award("going_event", { key: e.id });
              }}
              className={cn(
                "flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-bold pressable",
                going ? "bg-accent-gradient text-white" : "bg-zinc-800 text-zinc-200"
              )}
            >
              <Check className="w-3.5 h-3.5" /> Voy
            </button>
            <button onClick={() => downloadIcs(e)} aria-label="Añadir al calendario" className="p-2 rounded-full text-zinc-400 pressable">
              <CalendarPlus className="w-[18px] h-[18px]" />
            </button>
            <ShareButton
              title={e.title}
              text={`${e.venue} · ${e.city}`}
              url={e.url ?? "/eventos"}
              pointsKey={`event:${e.id}`}
              className="p-2 [&_svg]:w-[18px] [&_svg]:h-[18px]"
            />
            <CommentButton threadId={`event:${e.id}`} onClick={onOpen} className="px-2 [&_svg]:w-[18px] [&_svg]:h-[18px] [&_span]:text-xs" />
          </div>
        </div>
      )}
    </div>
  );
}
