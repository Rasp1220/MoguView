import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import VideoCard from "./VideoCard";
import { searchVideos } from "@/lib/videos";
import type { SliderCategory } from "@/lib/tags";

/** トップページの1カテゴリぶんの横スクロールスライダー（再生数の多い10件）。 */
export default async function VideoSlider({ category }: { category: SliderCategory }) {
  const videos = await searchVideos({ tag: category.tag, sort: "view_count", limit: 10 }).catch(
    () => [],
  );
  // まだ動画が貯まっていないカテゴリは枠ごと出さない
  if (videos.length === 0) return null;

  return (
    <section className="space-y-3" aria-labelledby={`slider-${category.tag}`}>
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 id={`slider-${category.tag}`} className="text-xl font-black">
            <span className="mr-1.5" aria-hidden>
              {category.emoji}
            </span>
            {category.tag}
          </h2>
          <p className="text-sm text-muted-foreground">{category.description}</p>
        </div>
        <Button asChild variant="outline" size="sm" className="flex-shrink-0">
          <Link href={`/search?tag=${encodeURIComponent(category.tag)}`}>
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
