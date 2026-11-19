import Link from "next/link";
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
          <h2 id={`slider-${category.tag}`} className="text-lg font-bold text-stone-800">
            <span className="mr-1.5" aria-hidden>
              {category.emoji}
            </span>
            {category.tag}
          </h2>
          <p className="text-xs text-stone-500">{category.description}</p>
        </div>
        <Link
          href={`/search?tag=${encodeURIComponent(category.tag)}`}
          className="flex-shrink-0 text-sm font-medium text-brand-600 hover:underline"
        >
          もっと見る
        </Link>
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
