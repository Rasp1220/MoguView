import { hasIngredients } from "@/lib/recipe";
import type { Video } from "@/lib/types";

/** 動画の説明文から抜き出した「材料」「作り方」を表示する。 */
export default function RecipePanel({ video }: { video: Video }) {
  const recipe = video.recipe;

  if (!recipe) {
    return (
      <p className="rounded-xl bg-stone-50 px-3 py-2 text-xs text-stone-500">
        材料・作り方は準備中です（取り込みの更新で順次反映されます）。
      </p>
    );
  }
  if (!hasIngredients(recipe) && recipe.steps.length === 0) {
    return (
      <p className="rounded-xl bg-stone-50 px-3 py-2 text-xs text-stone-500">
        この動画の説明文からは材料・作り方を読み取れませんでした。YouTubeの概要欄をご確認ください。
      </p>
    );
  }

  return (
    <section aria-label="材料と作り方" className="space-y-2">
      <div className="grid gap-4 md:grid-cols-2">
        {hasIngredients(recipe) && (
          <div>
            <h3 className="mb-1.5 text-sm font-bold text-stone-800">🥕 材料</h3>
            <ul className="divide-y divide-brand-100 rounded-xl border border-brand-100 bg-brand-50/40 text-sm">
              {recipe.ingredients.map((ing) => (
                <li key={ing.name} className="flex justify-between gap-3 px-3 py-1.5">
                  <span className="text-stone-700">{ing.name}</span>
                  <span className="flex-shrink-0 text-stone-500">{ing.amount}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {recipe.steps.length > 0 && (
          <div>
            <h3 className="mb-1.5 text-sm font-bold text-stone-800">👩‍🍳 作り方</h3>
            <ol className="space-y-1.5 text-sm text-stone-700">
              {recipe.steps.map((step, i) => (
                <li key={i} className="flex gap-2">
                  <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-brand-500 text-xs font-bold text-white">
                    {i + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
      <p className="text-xs text-stone-400">
        ※ 動画の説明文から自動で抜き出しています。正確な内容は動画・YouTubeでご確認ください。
      </p>
    </section>
  );
}
