// lib/profile.ts
// Basic profile settings kept on this device until accounts exist.
"use client";

import { useSyncExternalStore } from "react";
import { PUEBLOS } from "./pueblos";

export { PUEBLOS };


export type Lang = "es" | "en";

interface Profile {
  username: string;
  pueblo: string;
  lang: Lang;
  /** "Desde afuera": diaspora mode (news from home first, events in the States). */
  diaspora: boolean;
  /** Where the user lives when outside PR, e.g. "Orlando". */
  diasporaCity: string;
  /** Favorite team ids, as `${league}:${teamId}`. */
  teams: string[];
}

const KEY = "elhub:profile:v1";
const INITIAL: Profile = { username: "tuusuario", pueblo: "", lang: "es", diaspora: false, diasporaCity: "", teams: [] };
let state: Profile = INITIAL;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) state = { ...INITIAL, ...(JSON.parse(raw) as Profile) };
  } catch {
    state = INITIAL;
  }
}

export function updateProfile(patch: Partial<Profile>) {
  load();
  state = { ...state, ...patch };
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
  listeners.forEach((l) => l());
}

export function useProfile() {
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

export function toggleTeam(key: string): boolean {
  load();
  const on = !state.teams.includes(key);
  updateProfile({ teams: on ? [...state.teams, key] : state.teams.filter((t) => t !== key) });
  return on;
}
