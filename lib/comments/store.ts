// lib/comments/store.ts
// One comment store for the whole app. Every commentable thing (news story,
// X post, meme, reel, tema, encuesta) has a thread id like "meme:3".
// Threads start from optional seed comments and user changes are saved in
// localStorage, so they survive reloads on this device.
"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

export const CURRENT_USER = "tuusuario";

export interface CommentData {
  id: string;
  author: string;
  text: string;
  /** Preformatted time for seed data ("2h"); new comments use createdAt. */
  time?: string;
  createdAt?: number;
  likes: number;
  liked?: boolean;
  /** Top-level comment this is a reply to (one level deep, like Instagram). */
  parentId?: string | null;
  mine?: boolean;
  avatar?: string;
}

export interface SeedComment {
  author: string;
  text: string;
  time: string;
  likes?: number;
  avatar?: string;
  replies?: SeedComment[];
}

type State = Record<string, CommentData[]>;

const KEY = "elhub:comments:v1";
const EMPTY: State = {};
let state: State = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) state = JSON.parse(raw) as State;
  } catch {
    state = EMPTY;
  }
}

function subscribe(listener: () => void) {
  load();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  load();
  return state;
}

function getServerSnapshot() {
  return EMPTY;
}

function commit(next: State) {
  state = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Storage full or blocked: keep the in-memory copy.
  }
  listeners.forEach((l) => l());
}

export function flattenSeed(threadId: string, seed: SeedComment[] = []): CommentData[] {
  const out: CommentData[] = [];
  seed.forEach((c, i) => {
    const id = `${threadId}:s${i}`;
    out.push({ id, author: c.author.replace(/^@/, ""), text: c.text, time: c.time, likes: c.likes ?? 0, avatar: c.avatar, parentId: null });
    c.replies?.forEach((r, j) => {
      out.push({
        id: `${id}r${j}`,
        author: r.author.replace(/^@/, ""),
        text: r.text,
        time: r.time,
        likes: r.likes ?? 0,
        avatar: r.avatar,
        parentId: id,
      });
    });
  });
  return out;
}

function useThreadState(threadId: string, seed?: SeedComment[]) {
  const all = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const seeded = useMemo(() => flattenSeed(threadId, seed), [threadId, seed]);
  return all[threadId] ?? seeded;
}

/** Read and change one comment thread. */
export function useComments(threadId: string, seed?: SeedComment[]) {
  const comments = useThreadState(threadId, seed);

  const update = useCallback(
    (fn: (list: CommentData[]) => CommentData[]) => {
      const current = getSnapshot()[threadId] ?? flattenSeed(threadId, seed);
      commit({ ...getSnapshot(), [threadId]: fn(current) });
    },
    [threadId, seed]
  );

  const add = useCallback(
    (text: string, parentId: string | null = null) => {
      const comment: CommentData = {
        id: `${threadId}:${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
        author: CURRENT_USER,
        text,
        createdAt: Date.now(),
        likes: 0,
        parentId,
        mine: true,
      };
      update((list) => [...list, comment]);
      return comment;
    },
    [threadId, update]
  );

  const toggleLike = useCallback(
    (id: string) =>
      update((list) =>
        list.map((c) =>
          c.id === id ? { ...c, liked: !c.liked, likes: Math.max(0, c.likes + (c.liked ? -1 : 1)) } : c
        )
      ),
    [update]
  );

  const remove = useCallback(
    (id: string) => update((list) => list.filter((c) => c.id !== id && c.parentId !== id)),
    [update]
  );

  return { comments, count: comments.length, add, toggleLike, remove };
}

/** Just the number of comments in a thread (for buttons on cards). */
export function useCommentCount(threadId: string, seed?: SeedComment[]) {
  return useThreadState(threadId, seed).length;
}
