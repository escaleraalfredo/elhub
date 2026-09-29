// lib/sports/interactions.ts
// Fan interactions on games: predictions ("¿Quién gana?") and one reaction
// per game. Stored on this device; community numbers are seeded samples plus
// your own input until accounts are connected.
"use client";

import { useSyncExternalStore } from "react";

export type Side = "home" | "away";
export const GAME_REACTIONS = ["🔥", "😱", "🙌", "😤", "😂", "🐐"] as const;
export type GameReaction = (typeof GAME_REACTIONS)[number];

interface State {
  picks: Record<string, Side>;
  reactions: Record<string, GameReaction>;
}

const KEY = "elhub:games:v1";
const INITIAL: State = { picks: {}, reactions: {} };
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

export function setPick(gameId: string, side: Side) {
  load();
  commit({ ...state, picks: { ...state.picks, [gameId]: side } });
}

/** Toggle your reaction; returns true when a new reaction was set. */
export function toggleReaction(gameId: string, r: GameReaction): boolean {
  load();
  const reactions = { ...state.reactions };
  const on = reactions[gameId] !== r;
  if (on) reactions[gameId] = r;
  else delete reactions[gameId];
  commit({ ...state, reactions });
  return on;
}

export function useGameInteractions() {
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

function seed(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return (h >>> 0) / 4294967296;
}

/** Community pick split (sample baseline + your pick). */
export function communityPicks(gameId: string, mine?: Side) {
  const total = 40 + Math.round(seed(`${gameId}:n`) * 360);
  let home = Math.round(total * (0.3 + seed(`${gameId}:h`) * 0.4));
  let away = total - home;
  if (mine === "home") home++;
  if (mine === "away") away++;
  const sum = home + away;
  return { home, away, total: sum, homePct: Math.round((home / sum) * 100), awayPct: 100 - Math.round((home / sum) * 100) };
}

/** Reaction counts (sample baseline + yours). */
export function reactionCounts(gameId: string, mine?: GameReaction) {
  return GAME_REACTIONS.map((r, i) => {
    const base = Math.floor(seed(`${gameId}:r${i}`) ** 2 * 60);
    return { r, count: base + (mine === r ? 1 : 0), mine: mine === r };
  });
}
