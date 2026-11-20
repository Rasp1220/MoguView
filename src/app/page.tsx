import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import SearchBar from "@/components/SearchBar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import SeasonFeature from "@/components/SeasonFeature";
import VideoSlider from "@/components/VideoSlider";
import { currentMonthJst, getSeason } from "@/lib/seasons";
import { SLIDER_CATEGORIES } from "@/lib/tags";

// DB取得は no-store なので、毎リクエスト描画にそろえる（revalidate と混在させると
// 本番の再生成時に「静的→動的に変わった」エラーになることがある）
export const dynamic = "force-dynamic";

export default function HomePage() {
  const month = currentMonthJst();
  const season = getSeason(month);
  return (
    <div className="flex flex-col gap-10 py-2">
      <section className="grid items-center gap-6 md:grid-cols-[1fr_auto] md:gap-12">
        <div className="space-y-5">
          <div className="space-y-2">
            <h1 className="text-3xl font-black leading-tight sm:text-4xl">
              食べたい料理の動画を、
              <br className="hidden sm:block" />
              まるごと探そう
            </h1>
            <p className="text-muted-foreground">
              モグ（食べる）× ビュー（見る）。タイトルでもタグでも検索できます。
            </p>
          </div>
          <SearchBar />
          <ul className="flex flex-wrap gap-2" aria-label="料理のジャンル">
            {SLIDER_CATEGORIES.map((c) => (
              <li key={c.tag}>
                <Button asChild variant="outline" size="sm" className="rounded-full bg-card">
                  <Link href={`/search?tag=${encodeURIComponent(c.tag)}`}>
                    <span aria-hidden>{c.emoji}</span>
                    {c.tag}
                  </Link>
                </Button>
              </li>
            ))}
          </ul>
        </div>
        <Image
          src="/images/logo-top.png"
          alt="モグビュー"
          width={1254}
          height={1254}
          priority
          className="mx-auto hidden w-48 md:block lg:w-60"
        />
      </section>

      <Link
        href="/gacha"
        className="group flex w-full items-center gap-4 rounded-lg border border-amber-300/60 bg-secondary px-5 py-4 transition-colors hover:border-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <span className="text-4xl transition-transform group-hover:rotate-6" aria-hidden>
          🎰
        </span>
        <span className="flex-1">
          <span className="block font-display text-lg font-black text-secondary-foreground">今日の献立ガチャ</span>
          <span className="block text-sm text-secondary-foreground/80">
            主菜・副菜・汁物を、ボタン1つでランダムに提案。材料はそのまま買い物リストへ。
          </span>
        </span>
        <span className="hidden flex-shrink-0 items-center gap-1 text-sm font-bold text-primary sm:inline-flex">
          回してみる
          <ChevronRight className="h-4 w-4" aria-hidden />
        </span>
      </Link>

      <section aria-label={`${month}月の特集`} className="space-y-6">
        <div className="flex items-end justify-between gap-3">
          <h2 className="flex flex-wrap items-center gap-2 text-2xl font-black">
            {month}月の特集
            <Badge variant="secondary">{season.label}</Badge>
          </h2>
          <Button asChild variant="link" size="sm" className="flex-shrink-0">
            <Link href="/season">季節特集をもっと見る</Link>
          </Button>
        </div>
        {season.features.map((feature) => (
          <SeasonFeature key={feature.id} feature={feature} />
        ))}
      </section>

      {SLIDER_CATEGORIES.map((category) => (
        <VideoSlider key={category.tag} category={category} />
      ))}
    </div>
  );
}
