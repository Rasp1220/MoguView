import Link from "next/link";
import SearchBar from "@/components/SearchBar";
import VideoCard from "@/components/VideoCard";
import Pagination from "@/components/Pagination";
import { ALL_TAGS } from "@/lib/tags";
import { countVideos, searchVideos } from "@/lib/videos";
import type { VideoSort } from "@/lib/types";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 48;

interface Props {
  searchParams: { q?: string; tag?: string; sort?: string; page?: string };
}

export function generateMetadata({ searchParams }: Props) {
  const label = [searchParams.q, searchParams.tag].filter(Boolean).join(" / ");
  return { title: label ? `「${label}」の料理動画 | モグビュー` : "さがす | モグビュー" };
}

function buildHref(p: { q: string; tag: string; sort: VideoSort; page?: number }): string {
  const params = new URLSearchParams();
  if (p.q) params.set("q", p.q);
  if (p.tag) params.set("tag", p.tag);
  if (p.sort !== "view_count") params.set("sort", p.sort);
  if (p.page && p.page > 1) params.set("page", String(p.page));
  const qs = params.toString();
  return qs ? `/search?${qs}` : "/search";
}

export default async function SearchPage({ searchParams }: Props) {
  const q = (searchParams.q ?? "").trim().slice(0, 100);
  const tag = ALL_TAGS.includes(searchParams.tag ?? "") ? (searchParams.tag as string) : "";
  const sort: VideoSort = searchParams.sort === "published_at" ? "published_at" : "view_count";
  const page = Math.max(1, Math.trunc(Number(searchParams.page)) || 1);

  let videos: Awaited<ReturnType<typeof searchVideos>> = [];
  let total = 0;
  let error: string | null = null;
  try {
    [videos, total] = await Promise.all([
      searchVideos({ query: q, tag, sort, limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE }),
      countVideos({ query: q, tag }),
    ]);
  } catch (e) {
    error = e instanceof Error ? e.message : "検索に失敗しました";
  }
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const chip = "rounded-full border px-3 py-1.5 text-sm font-medium transition";
  return (
    <div className="flex flex-col gap-5">
      <SearchBar initialQuery={q} tag={tag} sort={sort === "view_count" ? "" : sort} />

      <div className="flex flex-wrap gap-2" aria-label="タグで絞り込み">
        <Link
          href={buildHref({ q, tag: "", sort })}
          className={`${chip} ${
            tag === ""
              ? "border-stone-700 bg-stone-700 text-white"
              : "border-stone-300 text-stone-600 hover:border-stone-500"
          }`}
        >
          すべて
        </Link>
        {ALL_TAGS.map((t) => (
          <Link
            key={t}
            href={buildHref({ q, tag: tag === t ? "" : t, sort })}
            aria-pressed={tag === t}
            className={`${chip} ${
              tag === t
                ? "border-brand-600 bg-brand-600 text-white"
                : "border-brand-200 text-stone-600 hover:border-brand-500"
            }`}
          >
            #{t}
          </Link>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-stone-500">
        <p>
          {q || tag ? (
            <>
              {[q && `「${q}」`, tag && `#${tag}`].filter(Boolean).join(" ")} の検索結果：
            </>
          ) : (
            "すべての動画："
          )}
          <strong className="ml-1 text-stone-800">{total.toLocaleString()}</strong>件
        </p>
        <div className="flex gap-1.5">
          {(
            [
              ["view_count", "人気順"],
              ["published_at", "新着順"],
            ] as const
          ).map(([value, label]) => (
            <Link
              key={value}
              href={buildHref({ q, tag, sort: value })}
              className={`${chip} py-1 ${
                sort === value
                  ? "border-stone-700 bg-stone-700 text-white"
                  : "border-stone-300 text-stone-600 hover:border-stone-500"
              }`}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>

      {error && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {!error && videos.length === 0 && (
        <p className="py-12 text-center text-stone-400">
          条件に一致する動画が見つかりませんでした。キーワードやタグを変えてみてください。
        </p>
      )}

      {videos.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {videos.map((video) => (
            <VideoCard key={video.videoId} video={video} />
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} hrefFor={(p) => buildHref({ q, tag, sort, page: p })} />
    </div>
  );
}
