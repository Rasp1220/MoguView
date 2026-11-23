"use client";

import type { Video } from "@/lib/types";
import { useMade, useShopping } from "@/lib/localStore";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
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
      className="group block h-full w-full rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
     <Card className="flex h-full flex-col overflow-hidden transition-colors group-hover:border-primary/50">
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        {/* 5万件のサムネイルを画像最適化に通さないよう、YouTubeのURLをそのまま使う */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={video.thumbnailUrl}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {(made || inList) && (
          <div className="absolute left-2 top-2 flex gap-1">
            {made && (
              <Badge variant="success">✔ 作った</Badge>
            )}
            {inList && (
              <Badge>🛒</Badge>
            )}
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="line-clamp-2 text-sm font-bold leading-snug">{video.title}</h3>
        <p className="line-clamp-1 text-xs text-muted-foreground">{video.channelTitle}</p>
        <p className="mt-auto pt-1 text-xs text-muted-foreground">{formatViews(video.viewCount)}</p>
      </div>
     </Card>
    </button>
  );
}
