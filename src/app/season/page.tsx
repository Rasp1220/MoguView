import Link from "next/link";
import SeasonFeature from "@/components/SeasonFeature";
import { SEASONS, currentMonthJst, getSeason } from "@/lib/seasons";

export const dynamic = "force-dynamic";
export const metadata = { title: "季節の料理特集 | モグビュー" };

export default function SeasonPage({ searchParams }: { searchParams: { m?: string } }) {
  const nowMonth = currentMonthJst();
  const requested = Math.trunc(Number(searchParams.m));
  const month = requested >= 1 && requested <= 12 ? requested : nowMonth;
  const season = getSeason(month);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-stone-800">🗓 季節の料理特集</h1>
        <p className="mt-1 text-sm text-stone-500">旬・行事に合わせて、いま作りたい料理動画を集めました。</p>
      </div>

      <nav aria-label="月を選ぶ" className="flex flex-wrap gap-2">
        {SEASONS.map((s) => (
          <Link
            key={s.month}
            href={`/season?m=${s.month}`}
            aria-current={s.month === month ? "page" : undefined}
            className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
              s.month === month
                ? "border-brand-600 bg-brand-600 text-white"
                : "border-brand-200 text-stone-600 hover:border-brand-500"
            }`}
          >
            {s.month}月{s.month === nowMonth && "（今月）"}
          </Link>
        ))}
      </nav>

      <h2 className="-mb-3 text-lg font-bold text-stone-700">
        {month}月：{season.label}
      </h2>
      {season.features.map((feature) => (
        <SeasonFeature key={feature.id} feature={feature} />
      ))}
    </div>
  );
}
