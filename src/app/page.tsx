import Image from "next/image";
import SearchBar from "@/components/SearchBar";
import VideoSlider from "@/components/VideoSlider";
import { SLIDER_CATEGORIES } from "@/lib/tags";

// 取り込みは1日単位なので、トップは5分キャッシュで十分
export const revalidate = 300;

export default function HomePage() {
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
        <SearchBar />
      </div>

      {SLIDER_CATEGORIES.map((category) => (
        <VideoSlider key={category.tag} category={category} />
      ))}
    </div>
  );
}
