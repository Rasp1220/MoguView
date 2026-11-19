"use client";

import Link from "next/link";
import { useState } from "react";
import { hasIngredients } from "@/lib/recipe";
import type { Video } from "@/lib/types";
import {
  addToShopping,
  markMade,
  removeFromShopping,
  setMemo,
  unmarkMade,
  useMade,
  useShopping,
} from "@/lib/localStore";

const btn = "inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-semibold transition";

/** 動画ごとの「買い物リストに入れる」「作った！」ボタン（ログイン不要・端末に保存）。 */
export default function VideoActions({ video }: { video: Video }) {
  const shopping = useShopping();
  const made = useMade();
  const inList = shopping.videos.some((v) => v.videoId === video.videoId);
  const entry = made[video.videoId];
  const canShop = hasIngredients(video.recipe);
  const [memoDraft, setMemoDraft] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={!canShop && !inList}
          onClick={() => (inList ? removeFromShopping(video.videoId) : addToShopping(video))}
          aria-pressed={inList}
          title={canShop || inList ? undefined : "材料を読み取れた動画だけ入れられます"}
          className={`${btn} ${
            inList
              ? "border-brand-600 bg-brand-600 text-white hover:bg-brand-700"
              : "border-brand-300 text-brand-700 hover:bg-brand-50 disabled:cursor-not-allowed disabled:border-stone-200 disabled:text-stone-400 disabled:hover:bg-transparent"
          }`}
        >
          🛒 {inList ? "買い物リストに入れた" : "買い物リストに入れる"}
        </button>
        <button
          type="button"
          onClick={() => (entry ? unmarkMade(video.videoId) : markMade(video))}
          aria-pressed={!!entry}
          className={`${btn} ${
            entry
              ? "border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700"
              : "border-emerald-300 text-emerald-700 hover:bg-emerald-50"
          }`}
        >
          ✔ {entry ? "作った！" : "作ったよ"}
        </button>
        {inList && (
          <Link href="/shopping" className="text-xs font-medium text-brand-600 hover:underline">
            リストを見る →
          </Link>
        )}
      </div>

      {entry && (
        <div className="space-y-1 rounded-xl border border-emerald-200 bg-emerald-50/60 p-3">
          <p className="text-xs text-emerald-800">
            {new Date(entry.madeAt).toLocaleDateString("ja-JP")} に作りました。
            <Link href="/made" className="ml-1 font-medium underline">
              記録を見る
            </Link>
          </p>
          <label className="block text-xs font-medium text-stone-600" htmlFor={`memo-${video.videoId}`}>
            メモ（アレンジ・感想など）
          </label>
          <textarea
            id={`memo-${video.videoId}`}
            value={memoDraft ?? entry.memo}
            onChange={(e) => {
              setMemoDraft(e.target.value);
              setMemo(video.videoId, e.target.value);
            }}
            onBlur={() => setMemoDraft(null)}
            rows={2}
            maxLength={500}
            placeholder="例：しょうゆを少し減らして子どもでも食べやすく"
            className="w-full resize-none rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
          />
        </div>
      )}
    </div>
  );
}
