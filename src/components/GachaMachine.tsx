"use client";

import Link from "next/link";
import { useState } from "react";
import { GACHA_ROLES, type GachaRole } from "@/lib/gachaRoles";
import { addToShopping, useShopping } from "@/lib/localStore";
import { hasIngredients } from "@/lib/recipe";
import type { Video } from "@/lib/types";
import VideoCard from "./VideoCard";

type Results = Partial<Record<GachaRole, Video | null>>;

const SPIN_MS = 800;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function GachaMachine() {
  const [results, setResults] = useState<Results>({});
  const [spinning, setSpinning] = useState<GachaRole[]>([]);
  const [round, setRound] = useState(0);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const shopping = useShopping();

  const drawn = GACHA_ROLES.map((r) => results[r.role]).filter((v): v is Video => !!v);
  const hasResult = Object.keys(results).length > 0;
  const busy = spinning.length > 0;

  async function draw(roles: GachaRole[]) {
    setError("");
    setNotice("");
    setSpinning(roles);
    // 引き直す役割の動画は除外し、それ以外（残す動画）と同じものを引かないようにする
    const keep = GACHA_ROLES.filter((r) => !roles.includes(r.role))
      .map((r) => results[r.role]?.videoId)
      .filter((id): id is string => !!id);
    const previous = roles.map((r) => results[r]?.videoId).filter((id): id is string => !!id);
    const exclude = [...keep, ...previous].join(",");
    try {
      const [res] = await Promise.all([
        fetch(`/api/gacha?roles=${roles.join(",")}&exclude=${encodeURIComponent(exclude)}`).then((r) => {
          if (!r.ok) throw new Error("ガチャに失敗しました");
          return r.json() as Promise<{ results: Results }>;
        }),
        sleep(SPIN_MS),
      ]);
      setResults((prev) => ({ ...prev, ...res.results }));
      setRound((n) => n + 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "ガチャに失敗しました");
    } finally {
      setSpinning([]);
    }
  }

  const shareText = [
    "🍽 今日の献立（モグビュー）",
    ...GACHA_ROLES.flatMap((r) => {
      const v = results[r.role];
      return v ? [`${r.emoji} ${r.label}：${v.title}`, `https://www.youtube.com/watch?v=${v.videoId}`] : [];
    }),
  ].join("\n");

  const shoppable = drawn.filter((v) => hasIngredients(v.recipe));
  const allInList = shoppable.length > 0 && shoppable.every((v) => shopping.videos.some((s) => s.videoId === v.videoId));

  async function copyShare() {
    try {
      await navigator.clipboard.writeText(shareText);
      setNotice("献立をコピーしました");
    } catch {
      setNotice("コピーできませんでした");
    }
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-stone-800">🎰 今日の献立ガチャ</h1>
        <p className="mt-1 text-sm text-stone-500">
          主菜・副菜・汁物の動画を1本ずつランダムに提案します。「今日なに作ろう？」をボタン1つで。
        </p>
      </div>

      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => draw(GACHA_ROLES.map((r) => r.role))}
          disabled={busy}
          className="rounded-full bg-brand-600 px-8 py-3 text-lg font-bold text-white shadow-md transition hover:bg-brand-700 disabled:opacity-60"
        >
          {busy ? "ガチャガチャ…" : hasResult ? "🔄 もう一回ガチャる" : "🎲 ガチャを回す"}
        </button>
      </div>

      {error && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-700">
          {error}
        </p>
      )}

      {hasResult || busy ? (
        <div className="grid gap-4 md:grid-cols-3">
          {GACHA_ROLES.map((r) => {
            const video = results[r.role];
            const isSpinning = spinning.includes(r.role);
            return (
              <section key={r.role} aria-label={r.label} className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-stone-800">
                    <span aria-hidden className="mr-1">
                      {r.emoji}
                    </span>
                    {r.label}
                  </h2>
                  {video !== undefined && (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => draw([r.role])}
                      className="text-xs font-medium text-brand-600 hover:underline disabled:opacity-50"
                    >
                      🔄 これだけ引き直す
                    </button>
                  )}
                </div>
                {isSpinning ? (
                  <div className="flex aspect-[4/3] animate-wiggle items-center justify-center rounded-2xl border border-dashed border-brand-300 bg-white text-5xl">
                    {r.emoji}
                  </div>
                ) : video ? (
                  <div key={`${video.videoId}-${round}`} className="animate-pop">
                    <VideoCard video={video} />
                  </div>
                ) : video === null ? (
                  <p className="rounded-2xl border border-dashed border-stone-300 bg-white px-4 py-10 text-center text-sm text-stone-400">
                    {r.label}の動画が見つかりませんでした
                  </p>
                ) : null}
              </section>
            );
          })}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3" aria-hidden>
          {GACHA_ROLES.map((r) => (
            <div
              key={r.role}
              className="flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-brand-200 bg-white text-stone-400"
            >
              <span className="text-5xl">{r.emoji}</span>
              <span className="text-sm font-medium">{r.label}</span>
            </div>
          ))}
        </div>
      )}

      {hasResult && drawn.length > 0 && !busy && (
        <div className="flex flex-wrap items-center justify-center gap-2 border-t border-brand-100 pt-5">
          <button
            type="button"
            disabled={shoppable.length === 0}
            onClick={() => {
              addToShopping(...shoppable);
              setNotice(`${shoppable.length}品の材料を買い物リストに入れました`);
            }}
            className="rounded-full border border-brand-400 px-5 py-2 text-sm font-semibold text-brand-700 transition hover:bg-brand-50 disabled:cursor-not-allowed disabled:border-stone-200 disabled:text-stone-400 disabled:hover:bg-transparent"
          >
            🛒 {allInList ? "買い物リストに入れ済み" : `材料をまとめて買い物リストへ（${shoppable.length}品）`}
          </button>
          <a
            href={`https://line.me/R/msg/text/?${encodeURIComponent(shareText)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-emerald-400 px-5 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
          >
            LINEで献立を送る
          </a>
          <button
            type="button"
            onClick={copyShare}
            className="rounded-full border border-stone-300 px-5 py-2 text-sm font-medium text-stone-600 hover:border-stone-500"
          >
            📋 コピー
          </button>
          {(allInList || notice.includes("買い物")) && (
            <Link href="/shopping" className="text-sm font-medium text-brand-600 hover:underline">
              リストを見る →
            </Link>
          )}
          <span role="status" className="w-full text-center text-xs text-emerald-700">
            {notice}
          </span>
        </div>
      )}
    </div>
  );
}
