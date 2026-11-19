"use client";

import { usePathname } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Video } from "@/lib/types";
import RecipePanel from "./RecipePanel";
import VideoActions from "./VideoActions";

const PlayerContext = createContext<{ open: (video: Video) => void }>({ open: () => {} });

export const useVideoPlayer = () => useContext(PlayerContext);

/** 動画カードを押すとYouTubeの埋め込みプレイヤーをモーダルで開く。 */
export function VideoPlayerProvider({ children }: { children: React.ReactNode }) {
  const [video, setVideo] = useState<Video | null>(null);
  const open = useCallback((v: Video) => setVideo(v), []);
  const value = useMemo(() => ({ open }), [open]);
  const pathname = usePathname();

  // モーダル内のリンク（「リストを見る」など）で画面を移ったら閉じる
  useEffect(() => {
    setVideo(null);
  }, [pathname]);

  useEffect(() => {
    if (!video) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setVideo(null);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [video]);

  return (
    <PlayerContext.Provider value={value}>
      {children}
      {video && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={video.title}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setVideo(null)}
        >
          <div
            className="max-h-[92vh] w-full max-w-3xl overflow-y-auto overscroll-contain rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="aspect-video w-full bg-black">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${video.videoId}?autoplay=1&rel=0`}
                title={video.title}
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
                className="h-full w-full"
              />
            </div>
            <div className="space-y-2 p-4">
              <h2 className="text-base font-bold text-stone-800">{video.title}</h2>
              <p className="text-sm text-stone-500">{video.channelTitle}</p>
              {video.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {video.tags.map((t) => (
                    <a
                      key={t}
                      href={`/search?tag=${encodeURIComponent(t)}`}
                      className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700 hover:bg-brand-100"
                    >
                      #{t}
                    </a>
                  ))}
                </div>
              )}
              <VideoActions video={video} />
              <RecipePanel video={video} />
              <div className="flex justify-end gap-3 pt-1 text-sm">
                <a
                  href={`https://www.youtube.com/watch?v=${video.videoId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-brand-600 hover:underline"
                >
                  YouTubeで開く
                </a>
                <button
                  type="button"
                  onClick={() => setVideo(null)}
                  className="rounded-full border border-stone-300 px-4 py-1 text-stone-600 hover:border-stone-500"
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PlayerContext.Provider>
  );
}
