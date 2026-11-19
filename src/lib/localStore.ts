"use client";

/**
 * ログイン不要で使う「買い物リスト」「作ったよ記録」の保存先。
 * ブラウザの localStorage に保存する（端末ごと。別の端末とは同期しない）。
 * localStorage が使えない環境（プライベートモード等）では、そのタブの間だけメモリに持つ。
 */
import { useSyncExternalStore } from "react";
import type { Video } from "./types";

const SHOPPING_KEY = "moguview:shopping:v1";
const MADE_KEY = "moguview:made:v1";
const MAX_SHOPPING_VIDEOS = 30;
const MAX_MADE = 300;

const listeners = new Set<() => void>();
const memory = new Map<string, string>();
const parsed = new Map<string, { raw: string | null; value: unknown }>();

function readRaw(key: string): string | null {
  try {
    return window.localStorage.getItem(key) ?? memory.get(key) ?? null;
  } catch {
    return memory.get(key) ?? null;
  }
}

function read<T>(key: string, fallback: T): T {
  const raw = readRaw(key);
  const hit = parsed.get(key);
  if (hit && hit.raw === raw) return hit.value as T;
  let value: T = fallback;
  if (raw) {
    try {
      value = JSON.parse(raw) as T;
    } catch {
      value = fallback;
    }
  }
  parsed.set(key, { raw, value });
  return value;
}

function write<T>(key: string, value: T): void {
  const raw = JSON.stringify(value);
  memory.set(key, raw);
  try {
    window.localStorage.setItem(key, raw);
  } catch {
    /* 容量超過・保存禁止でもメモリには残る */
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === SHOPPING_KEY || e.key === MADE_KEY || e.key === null) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function useStore<T>(key: string, fallback: T): T {
  return useSyncExternalStore(
    subscribe,
    () => read(key, fallback),
    () => fallback,
  );
}

// ───────── 買い物リスト ─────────

export interface ShoppingState {
  /** リストに入れた動画（材料はここから合算する） */
  videos: Video[];
  /** 買い物済みにチェックした食材のキー */
  checked: string[];
  /** 手で足したメモ（牛乳 など） */
  extras: { id: string; name: string }[];
}

const EMPTY_SHOPPING: ShoppingState = { videos: [], checked: [], extras: [] };

export const useShopping = () => useStore(SHOPPING_KEY, EMPTY_SHOPPING);
const getShopping = () => read(SHOPPING_KEY, EMPTY_SHOPPING);

export function addToShopping(...videos: Video[]): void {
  const cur = getShopping();
  const have = new Set(cur.videos.map((v) => v.videoId));
  const added = videos.filter((v) => !have.has(v.videoId));
  if (added.length === 0) return;
  write(SHOPPING_KEY, { ...cur, videos: [...cur.videos, ...added].slice(-MAX_SHOPPING_VIDEOS) });
}

export function removeFromShopping(videoId: string): void {
  const cur = getShopping();
  write(SHOPPING_KEY, { ...cur, videos: cur.videos.filter((v) => v.videoId !== videoId) });
}

export function toggleChecked(key: string): void {
  const cur = getShopping();
  const checked = cur.checked.includes(key) ? cur.checked.filter((k) => k !== key) : [...cur.checked, key];
  write(SHOPPING_KEY, { ...cur, checked });
}

export function addExtra(name: string): void {
  const text = name.trim().slice(0, 40);
  if (!text) return;
  const cur = getShopping();
  write(SHOPPING_KEY, { ...cur, extras: [...cur.extras, { id: `${Date.now()}-${cur.extras.length}`, name: text }] });
}

export function removeExtra(id: string): void {
  const cur = getShopping();
  write(SHOPPING_KEY, { ...cur, extras: cur.extras.filter((e) => e.id !== id) });
}

/** 買い物済みのチェックをすべて外す。 */
export function clearChecked(): void {
  const cur = getShopping();
  write(SHOPPING_KEY, { ...cur, checked: [] });
}

export function clearShopping(): void {
  write(SHOPPING_KEY, EMPTY_SHOPPING);
}

// ───────── 作ったよ記録 ─────────

export interface MadeEntry {
  video: Video;
  /** 作った日時（ISO） */
  madeAt: string;
  memo: string;
}

export type MadeState = Record<string, MadeEntry>;
const EMPTY_MADE: MadeState = {};

export const useMade = () => useStore(MADE_KEY, EMPTY_MADE);
const getMade = () => read(MADE_KEY, EMPTY_MADE);

export function markMade(video: Video): void {
  const cur = getMade();
  if (cur[video.videoId]) return;
  const next: MadeState = { ...cur, [video.videoId]: { video, madeAt: new Date().toISOString(), memo: "" } };
  const entries = Object.entries(next).sort((a, b) => b[1].madeAt.localeCompare(a[1].madeAt)).slice(0, MAX_MADE);
  write(MADE_KEY, Object.fromEntries(entries));
}

export function unmarkMade(videoId: string): void {
  const cur = getMade();
  if (!cur[videoId]) return;
  const { [videoId]: _removed, ...rest } = cur;
  void _removed;
  write(MADE_KEY, rest);
}

export function setMemo(videoId: string, memo: string): void {
  const cur = getMade();
  if (!cur[videoId]) return;
  write(MADE_KEY, { ...cur, [videoId]: { ...cur[videoId], memo: memo.slice(0, 500) } });
}
