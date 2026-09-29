// lib/events/store.ts
// Saved / "Voy" events, kept on this device.
"use client";

import { useSyncExternalStore } from "react";
import type { EventItem } from "./types";

interface State {
  saved: Record<string, EventItem>;
  going: Record<string, EventItem>;
}

const KEY = "elhub:events:v1";
const INITIAL: State = { saved: {}, going: {} };
let state: State = INITIAL;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) state = { ...INITIAL, ...(JSON.parse(raw) as State) };
  } catch {
    state = INITIAL;
  }
}

function commit(next: State) {
  state = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
  listeners.forEach((l) => l());
}

export function toggleEvent(list: "saved" | "going", event: EventItem): boolean {
  load();
  const current = { ...state[list] };
  const on = !current[event.id];
  if (on) current[event.id] = event;
  else delete current[event.id];
  commit({ ...state, [list]: current });
  return on;
}

export function useEventLists() {
  return useSyncExternalStore(
    (l) => {
      load();
      listeners.add(l);
      return () => {
        listeners.delete(l);
      };
    },
    () => {
      load();
      return state;
    },
    () => INITIAL
  );
}

/** Build an .ics file so the event can be added to any phone calendar. */
export function downloadIcs(e: EventItem) {
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const start = new Date(e.start);
  const end = new Date(start.getTime() + 3 * 3600_000);
  const esc = (s: string) => s.replace(/[,;\\]/g, (c) => `\\${c}`).replace(/\n/g, "\\n");
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//ElHub PR//Eventos//ES",
    "BEGIN:VEVENT",
    `UID:${e.id}@elhub`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:${esc(e.title)}`,
    `LOCATION:${esc(`${e.venue}, ${e.city}, Puerto Rico`)}`,
    e.url ? `URL:${e.url}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");
  const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `${e.title.replace(/[^\w\s-]/g, "").slice(0, 40) || "evento"}.ics`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
