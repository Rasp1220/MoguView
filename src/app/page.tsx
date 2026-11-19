import Image from "next/image";
import Link from "next/link";
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
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-5 pt-2 text-center">
        <Image
          src="/images/logo-top.png"
          alt="モグビュー"
          width={1254}
          height={1254}
          priority
          className="mx-auto w-full max-w-[16rem] sm:max-w-xs"
        />
        <div className="space-y-1.5">
          <h1 className="text-xl font-bold text-stone-800 sm:text-2xl">
            食べたい料理の動画を、まるごと探そう
          </h1>
          <p className="text-sm text-stone-500">
            モグ（食べる）× ビュー（見る）。タイトルでもタグでも検索できます。
          </p>
        </div>
      </div>

      <Link
        href="/gacha"
        className="mx-auto flex w-full max-w-3xl items-center gap-4 rounded-2xl border border-brand-200 bg-gradient-to-r from-brand-50 to-amber-50 px-5 py-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
      >
        <span className="text-4xl" aria-hidden>
          🎰
        </span>
        <span className="flex-1">
          <span className="block font-bold text-stone-800">今日の献立ガチャ</span>
          <span className="block text-sm text-stone-500">
            主菜・副菜・汁物を、ボタン1つでランダムに提案。材料はそのまま買い物リストへ。
          </span>
        </span>
        <span className="flex-shrink-0 text-sm font-semibold text-brand-600">回してみる →</span>
      </Link>

      <section aria-label={`${month}月の特集`} className="space-y-6">
        <div className="flex items-end justify-between gap-3">
          <h2 className="text-xl font-bold text-stone-800">
            🗓 {month}月の特集
            <span className="ml-2 text-sm font-medium text-brand-600">{season.label}</span>
          </h2>
          <Link href="/season" className="flex-shrink-0 text-sm font-medium text-brand-600 hover:underline">
            季節特集をもっと見る
          </Link>
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
