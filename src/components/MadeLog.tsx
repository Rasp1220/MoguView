"use client";

import Link from "next/link";
import { useMemo } from "react";
import { setMemo, unmarkMade, useMade } from "@/lib/localStore";
import { useVideoPlayer } from "./VideoPlayer";

export default function MadeLog() {
  const made = useMade();
  const { open } = useVideoPlayer();
  const entries = useMemo(
    () => Object.values(made).sort((a, b) => b.madeAt.localeCompare(a.madeAt)),
    [made],
  );
  // madeAt はUTCのISO文字列なので、端末の時刻（日本なら日本時間）で月を比べる
  const now = new Date();
  const monthCount = entries.filter((e) => {
    const d = new Date(e.madeAt);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  }).length;

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-800">✔ 作ったよ記録</h1>
        <p className="mt-1 text-sm text-stone-500">
          動画の画面で「作ったよ」を押すと、ここに残ります。このリストはお使いの端末のブラウザに保存されます（ログイン不要）。
        </p>
      </div>

      {entries.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-emerald-200 bg-white px-6 py-12 text-center text-stone-500">
          <p className="mb-4">まだ記録がありません。作った料理の動画で「✔ 作ったよ」を押してみましょう。</p>
          <Link href="/search" className="rounded-full bg-brand-600 px-5 py-2 text-sm font-medium text-white hover:bg-brand-700">
            動画をさがす
          </Link>
        </div>
      ) : (
        <>
          <div className="flex gap-3">
            <div className="flex-1 rounded-2xl border border-emerald-200 bg-emerald-50/60 px-4 py-3 text-center">
              <p className="text-xs text-emerald-800">これまでに作った</p>
              <p className="text-2xl font-bold text-emerald-700">
                {entries.length}
                <span className="ml-1 text-sm font-medium">品</span>
              </p>
            </div>
            <div className="flex-1 rounded-2xl border border-brand-200 bg-brand-50/60 px-4 py-3 text-center">
              <p className="text-xs text-brand-700">今月</p>
              <p className="text-2xl font-bold text-brand-600">
                {monthCount}
                <span className="ml-1 text-sm font-medium">品</span>
              </p>
            </div>
          </div>

          <ul className="grid gap-4 sm:grid-cols-2">
            {entries.map((e) => (
              <li key={e.video.videoId} className="flex flex-col overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-sm">
                <button type="button" onClick={() => open(e.video)} className="flex gap-3 p-3 text-left">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={e.video.thumbnailUrl} alt="" className="h-16 w-28 flex-shrink-0 rounded-lg object-cover" />
                  <span className="min-w-0">
                    <span className="line-clamp-2 text-sm font-semibold text-stone-800">{e.video.title}</span>
                    <span className="mt-1 block text-xs text-emerald-700">
                      {new Date(e.madeAt).toLocaleDateString("ja-JP")} に作りました
                    </span>
                  </span>
                </button>
                <div className="flex flex-1 flex-col gap-2 px-3 pb-3">
                  <textarea
                    aria-label={`${e.video.title}のメモ`}
                    value={e.memo}
                    onChange={(ev) => setMemo(e.video.videoId, ev.target.value)}
                    rows={2}
                    maxLength={500}
                    placeholder="メモ（アレンジ・感想など）"
                    className="w-full resize-none rounded-lg border border-emerald-100 bg-emerald-50/30 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm("この記録を削除しますか？")) unmarkMade(e.video.videoId);
                    }}
                    className="self-end text-xs text-stone-400 hover:text-red-500"
                  >
                    記録を削除
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
