// lib/points.ts
// ElHub points ("puntos") and levels.
//
// Design (modeled on Duolingo XP, Waze points and Reddit karma):
// - Points come from real, useful activity: reading, commenting, voting,
//   predicting games, planning events, checking in to pueblos.
// - Every action has a small value and a DAILY CAP, so spamming doesn't pay;
//   coming back every day (streak) and being right (correct predictions) do.
// - Some actions only count once per item (reading the same story, predicting
//   the same game), tracked with a key.
// - Lifetime points set your level; points from the last 7 days set your
//   weekly ranking, so new users can climb the leaderboard quickly.
// Everything is stored on this device until accounts are connected.
"use client";

import { useSyncExternalStore } from "react";
import { toast } from "sonner";

export type Action =
  | "daily_visit"
  | "read_news"
  | "share"
  | "comment"
  | "like"
  | "vote_topic"
  | "vote_poll"
  | "create_topic"
  | "create_poll"
  | "predict"
  | "correct_pick"
  | "react_game"
  | "save_event"
  | "going_event"
  | "checkin_pueblo";

export const RULES: Record<Action, { points: number; dailyCap: number; label: string }> = {
  daily_visit: { points: 5, dailyCap: 1, label: "Visita diaria (+1 por día de racha, máx. +10)" },
  read_news: { points: 1, dailyCap: 15, label: "Leer una noticia" },
  share: { points: 2, dailyCap: 5, label: "Compartir" },
  comment: { points: 5, dailyCap: 10, label: "Comentar" },
  like: { points: 1, dailyCap: 20, label: "Dar me gusta" },
  vote_topic: { points: 1, dailyCap: 20, label: "Votar en un tema" },
  vote_poll: { points: 2, dailyCap: 10, label: "Votar en una encuesta" },
  create_topic: { points: 10, dailyCap: 3, label: "Crear un tema" },
  create_poll: { points: 10, dailyCap: 2, label: "Crear una encuesta" },
  predict: { points: 2, dailyCap: 15, label: "Pronosticar un juego" },
  correct_pick: { points: 10, dailyCap: 30, label: "Pronóstico acertado" },
  react_game: { points: 1, dailyCap: 20, label: "Reaccionar a un juego" },
  save_event: { points: 2, dailyCap: 10, label: "Guardar un evento" },
  going_event: { points: 3, dailyCap: 5, label: "Marcar “Voy” a un evento" },
  checkin_pueblo: { points: 10, dailyCap: 3, label: "Check-in en tu pueblo" },
};

export const LEVELS = [
  { min: 0, title: "Nuevo en el barrio" },
  { min: 100, title: "Vecino" },
  { min: 250, title: "Jíbaro" },
  { min: 500, title: "Boricua" },
  { min: 900, title: "Wepa" },
  { min: 1500, title: "Cangri" },
  { min: 2500, title: "Leyenda del barrio" },
  { min: 4000, title: "Embajador" },
  { min: 6000, title: "Ícono" },
  { min: 9000, title: "Leyenda boricua" },
];

export function levelFor(total: number) {
  let i = 0;
  while (i + 1 < LEVELS.length && total >= LEVELS[i + 1].min) i++;
  const cur = LEVELS[i];
  const next = LEVELS[i + 1];
  return {
    level: i + 1,
    title: cur.title,
    min: cur.min,
    next: next?.min ?? null,
    progress: next ? (total - cur.min) / (next.min - cur.min) : 1,
  };
}

interface Entry {
  a: Action;
  p: number;
  t: number;
}

interface State {
  total: number;
  ledger: Entry[];
  keys: string[];
  counts: Partial<Record<Action, number>>;
  streak: { count: number; day: string };
}

const KEY = "elhub:points:v1";
const INITIAL: State = { total: 0, ledger: [], keys: [], counts: {}, streak: { count: 0, day: "" } };
const LEDGER_DAYS = 35;
let state: State = INITIAL;
let loaded = false;
const listeners = new Set<() => void>();

const dayKey = (t = Date.now()) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "America/Puerto_Rico" }).format(t);

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
  const cutoff = Date.now() - LEDGER_DAYS * 86_400_000;
  state = { ...next, ledger: next.ledger.filter((e) => e.t >= cutoff), keys: next.keys.slice(-2000) };
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // ignore storage errors
  }
  listeners.forEach((l) => l());
}

function todayCount(s: State, action: Action) {
  const today = dayKey();
  return s.ledger.filter((e) => e.a === action && dayKey(e.t) === today).length;
}

/**
 * Give points for an action. Returns points awarded (0 when the daily cap
 * was reached or `key` was already rewarded).
 */
export function award(action: Action, opts: { key?: string; silent?: boolean } = {}): number {
  load();
  const rule = RULES[action];
  const dedupe = opts.key ? `${action}:${opts.key}` : null;
  if (dedupe && state.keys.includes(dedupe)) return 0;
  if (todayCount(state, action) >= rule.dailyCap) return 0;

  let points = rule.points;
  let streak = state.streak;
  if (action === "daily_visit") {
    const today = dayKey();
    const yesterday = dayKey(Date.now() - 86_400_000);
    const count = streak.day === yesterday ? streak.count + 1 : 1;
    streak = { count, day: today };
    points += Math.min(count - 1, 10);
  }

  commit({
    total: state.total + points,
    ledger: [...state.ledger, { a: action, p: points, t: Date.now() }],
    keys: dedupe ? [...state.keys, dedupe] : state.keys,
    counts: { ...state.counts, [action]: (state.counts[action] ?? 0) + 1 },
    streak,
  });
  if (!opts.silent) toast(`+${points} pts`, { description: RULES[action].label.split(" (")[0], duration: 1600 });
  return points;
}

/** Call once per app load; awards the daily visit and keeps the streak. */
export function registerVisit() {
  load();
  if (state.streak.day !== dayKey()) award("daily_visit");
}

function subscribe(l: () => void) {
  load();
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

function getSnapshot() {
  load();
  return state;
}

function getServerSnapshot() {
  return INITIAL;
}

function summarize(s: State, now = Date.now()) {
  const weekAgo = now - 7 * 86_400_000;
  const weekly = s.ledger.filter((e) => e.t >= weekAgo).reduce((sum, e) => sum + e.p, 0);
  const alive = s.streak.day === dayKey(now) || s.streak.day === dayKey(now - 86_400_000);
  return { weekly, streak: alive ? s.streak.count : 0 };
}

export function usePoints() {
  const s = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const { weekly, streak } = summarize(s);
  return {
    total: s.total,
    weekly,
    streak,
    counts: s.counts,
    ledger: s.ledger,
    level: levelFor(s.total),
    todayCount: (a: Action) => todayCount(s, a),
    award,
  };
}
