"use client";

import type { Video } from "@/lib/types";
import { useMade, useShopping } from "@/lib/localStore";
import { useVideoPlayer } from "./VideoPlayer";

function formatViews(n: number): string {
  if (n >= 10000) return `${(n / 10000).toFixed(n >= 100000 ? 0 : 1)}万回再生`;
  return `${n.toLocaleString()}回再生`;
}

export default function VideoCard({ video }: { video: Video }) {
  const { open } = useVideoPlayer();
  const made = useMade()[video.videoId];
  const inList = useShopping().videos.some((v) => v.videoId === video.videoId);
  return (
    <button
      type="button"
      onClick={() => open(video)}
      className="group flex h-full w-full flex-col overflow-hidden rounded-2xl border border-brand-100 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-stone-100">
        {/* 5万件のサムネイルを画像最適化に通さないよう、YouTubeのURLをそのまま使う */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={video.thumbnailUrl}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition group-hover:scale-105"
        />
        {(made || inList) && (
          <div className="absolute left-2 top-2 flex gap-1">
            {made && (
              <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-xs font-bold text-white shadow">✔ 作った</span>
            )}
            {inList && (
              <span className="rounded-full bg-brand-600 px-2 py-0.5 text-xs font-bold text-white shadow">🛒</span>
            )}
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="line-clamp-2 text-sm font-semibold text-stone-800">{video.title}</h3>
        <p className="line-clamp-1 text-xs text-stone-500">{video.channelTitle}</p>
        <p className="mt-auto pt-1 text-xs text-stone-400">{formatViews(video.viewCount)}</p>
      </div>
    </button>
  );
}
