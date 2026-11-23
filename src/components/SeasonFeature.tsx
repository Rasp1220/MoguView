import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import VideoCard from "./VideoCard";
import { searchVideos } from "@/lib/videos";
import type { SeasonFeature as Feature } from "@/lib/seasons";
import type { Video } from "@/lib/types";

const PER_FEATURE = 10;

/** 特集のキーワードのどれかに一致する動画を、再生数の多い順に並べる。 */
export async function loadFeatureVideos(feature: Feature, limit = PER_FEATURE): Promise<Video[]> {
  const lists = await Promise.all(
    feature.keywords.map((keyword) =>
      searchVideos({ query: keyword, sort: "view_count", limit }).catch(() => [] as Video[]),
    ),
  );
  const unique = new Map<string, Video>();
  for (const v of lists.flat()) unique.set(v.videoId, v);
  return [...unique.values()].sort((a, b) => b.viewCount - a.viewCount).slice(0, limit);
}

/** 季節特集1つぶんの横スクロールスライダー。動画が無い特集は枠ごと出さない。 */
export default async function SeasonFeature({ feature }: { feature: Feature }) {
  const videos = await loadFeatureVideos(feature);
  if (videos.length === 0) return null;

  return (
    <section className="space-y-3" aria-labelledby={`season-${feature.id}`}>
      <div className="flex items-end justify-between gap-3">
        <div>
          <h3 id={`season-${feature.id}`} className="text-lg font-black">
            <span className="mr-1.5" aria-hidden>
              {feature.emoji}
            </span>
            {feature.title}
          </h3>
          <p className="text-sm text-muted-foreground">{feature.description}</p>
        </div>
        <Button asChild variant="outline" size="sm" className="flex-shrink-0">
          <Link href={`/search?q=${encodeURIComponent(feature.keywords[0])}`}>
            もっと見る
            <ChevronRight className="h-4 w-4" aria-hidden />
          </Link>
        </Button>
      </div>

      <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 pb-2">
        {videos.map((video) => (
          <div
            key={video.videoId}
            className="w-52 flex-shrink-0 snap-start sm:w-60 lg:w-[calc((100%-3rem)/4)] xl:w-[calc((100%-4rem)/5)]"
          >
            <VideoCard video={video} />
          </div>
        ))}
      </div>
    </section>
  );
}
