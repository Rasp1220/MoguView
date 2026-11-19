/**
 * Supabase未設定のローカル開発（NODE_ENV !== "production"）でだけ使う
 * サンプルデータ。SQL関数 `search_videos` / `videos_match` と同じ絞り込み・
 * 並び順を JS で再現している。本番では使われない。
 */
import { extractRecipe } from "./recipe";
import { detectTags } from "./tags";
import type { Video, VideoSort } from "./types";

const DISHES: { name: string; emoji: string; color: string }[] = [
  { name: "天ぷら", emoji: "🍤", color: "#f6c453" },
  { name: "寿司", emoji: "🍣", color: "#ff8f8f" },
  { name: "肉じゃが", emoji: "🥔", color: "#d9a066" },
  { name: "餃子", emoji: "🥟", color: "#f2b880" },
  { name: "麻婆豆腐", emoji: "🌶️", color: "#e8553d" },
  { name: "チャーハン", emoji: "🍚", color: "#f0c869" },
  { name: "家系ラーメン", emoji: "🍜", color: "#e9a23b" },
  { name: "つけ麺", emoji: "🍜", color: "#c98a4b" },
  { name: "担々麺", emoji: "🍜", color: "#d9482b" },
  { name: "カルボナーラ", emoji: "🍝", color: "#f3d98b" },
  { name: "マルゲリータピザ", emoji: "🍕", color: "#f08a5d" },
  { name: "ペペロンチーノ", emoji: "🍝", color: "#e8b84a" },
  { name: "チーズケーキ", emoji: "🍰", color: "#f7d9a8" },
  { name: "プリン", emoji: "🍮", color: "#f2b441" },
  { name: "パンケーキ", emoji: "🥞", color: "#e3a76f" },
  { name: "ハンバーグ", emoji: "🍔", color: "#b86b3c" },
  { name: "オムライス", emoji: "🍳", color: "#f5c242" },
  { name: "カレー", emoji: "🍛", color: "#c98b2b" },
  { name: "焼肉", emoji: "🥩", color: "#c4473a" },
  { name: "キムチ鍋", emoji: "🍲", color: "#d6402a" },
  // 献立ガチャ（主菜・副菜・汁物）用
  { name: "生姜焼き", emoji: "🥓", color: "#d99a6c" },
  { name: "唐揚げ", emoji: "🍗", color: "#e8b04a" },
  { name: "ポテトサラダ", emoji: "🥗", color: "#f3e3a0" },
  { name: "きんぴらごぼう", emoji: "🥕", color: "#c7793f" },
  { name: "ほうれん草のナムル", emoji: "🥬", color: "#7fb069" },
  { name: "味噌汁", emoji: "🍵", color: "#d9a066" },
  { name: "豚汁", emoji: "🍲", color: "#cf8b52" },
  { name: "わかめスープ", emoji: "🥣", color: "#8fbf8f" },
  // 季節特集用
  { name: "おでん", emoji: "🍢", color: "#d9a066" },
  { name: "ビーフシチュー", emoji: "🥘", color: "#a8553a" },
  { name: "ポトフ", emoji: "🥘", color: "#e8b86a" },
  { name: "おせち", emoji: "🎍", color: "#e0584a" },
  { name: "そうめん", emoji: "🍜", color: "#cfe3f0" },
  { name: "かき氷", emoji: "🍧", color: "#a8d8f0" },
  { name: "ローストチキン", emoji: "🍗", color: "#c98241" },
  { name: "年越しそば", emoji: "🍜", color: "#b59a7a" },
  { name: "ちらし寿司", emoji: "🍣", color: "#f4a6a6" },
  { name: "栗ご飯", emoji: "🌰", color: "#c9a26b" },
  { name: "BBQ", emoji: "🔥", color: "#e07a3a" },
  { name: "お花見弁当", emoji: "🌸", color: "#f6b8c8" },
];

/** 料理ごとの材料と作り方（サンプルの説明文に書く）。無い料理は共通の内容にする。 */
const RECIPES: Record<string, { ingredients: string[]; steps: string[] }> = {
  肉じゃが: {
    ingredients: ["牛薄切り肉 200g", "じゃがいも 3個", "玉ねぎ 1個", "にんじん 1本", "しょうゆ 大さじ3", "砂糖 大さじ2", "みりん 大さじ2", "水 300ml"],
    steps: ["具材を食べやすい大きさに切る", "牛肉と野菜を油で炒める", "水と調味料を入れて落とし蓋で15分煮込む"],
  },
  餃子: {
    ingredients: ["豚ひき肉 200g", "キャベツ 1/4個", "にら 1/2束", "しょうが 1かけ", "しょうゆ 大さじ1", "ごま油 大さじ1", "餃子の皮 24枚"],
    steps: ["野菜をみじん切りにして塩もみする", "ひき肉と調味料を混ぜて餡を作る", "皮で包み、焼いて蒸し焼きにする"],
  },
  麻婆豆腐: {
    ingredients: ["豆腐 1丁", "豚ひき肉 150g", "長ねぎ 1/2本", "にんにく 1片", "しょうゆ 大さじ1", "片栗粉 小さじ2", "水 150ml"],
    steps: ["豆腐を水切りして角切りにする", "ひき肉と香味野菜を炒め、調味料と水を加える", "豆腐を入れて煮て、水溶き片栗粉でとろみをつける"],
  },
  ハンバーグ: {
    ingredients: ["合いびき肉 300g", "玉ねぎ 1/2個", "卵 1個", "パン粉 大さじ4", "牛乳 大さじ2", "塩 少々", "サラダ油 適量"],
    steps: ["玉ねぎをみじん切りにして炒め、冷ます", "全部の材料をよく練って成形する", "両面を焼き、蓋をして蒸し焼きにする"],
  },
  カレー: {
    ingredients: ["豚こま肉 300g", "じゃがいも 2個", "玉ねぎ 2個", "にんじん 1本", "カレールー 1箱", "水 800ml", "サラダ油 適量"],
    steps: ["具材を切って油で炒める", "水を加えてアクを取りながら20分煮込む", "火を止めてルーを溶かし、さらに10分煮る"],
  },
  生姜焼き: {
    ingredients: ["豚ロース薄切り 300g", "玉ねぎ 1個", "しょうゆ 大さじ2", "みりん 大さじ2", "酒 大さじ1", "しょうが 1かけ", "サラダ油 適量"],
    steps: ["豚肉を調味料に5分漬ける", "玉ねぎをくし切りにして炒める", "豚肉を加えて、タレを絡めながら焼く"],
  },
  唐揚げ: {
    ingredients: ["鶏もも肉 2枚", "しょうゆ 大さじ2", "酒 大さじ1", "しょうが 1かけ", "にんにく 1片", "片栗粉 適量", "揚げ油 適量"],
    steps: ["鶏肉を一口大に切って下味を揉み込む", "片栗粉をまぶす", "170度の油で揚げ、一度取り出して休ませ、二度揚げする"],
  },
  ポテトサラダ: {
    ingredients: ["じゃがいも 3個", "きゅうり 1本", "にんじん 1/2本", "ハム 4枚", "マヨネーズ 大さじ4", "塩 少々", "こしょう 少々"],
    steps: ["じゃがいもを茹でて皮をむき、潰す", "きゅうりとにんじんを薄切りにして塩もみする", "全部を混ぜて味を調える"],
  },
  きんぴらごぼう: {
    ingredients: ["ごぼう 1本", "にんじん 1/2本", "しょうゆ 大さじ2", "みりん 大さじ2", "砂糖 大さじ1", "ごま油 大さじ1", "白ごま 適量"],
    steps: ["ごぼうとにんじんを細切りにする", "ごま油で炒める", "調味料を加えて汁気がなくなるまで炒める"],
  },
  ほうれん草のナムル: {
    ingredients: ["ほうれん草 1束", "ごま油 大さじ1", "しょうゆ 小さじ2", "にんにく 少々", "塩 少々", "白ごま 適量"],
    steps: ["ほうれん草を茹でて水にさらし、絞る", "食べやすく切る", "調味料で和える"],
  },
  味噌汁: {
    ingredients: ["豆腐 1/2丁", "わかめ 適量", "長ねぎ 1/2本", "だし汁 600ml", "味噌 大さじ3"],
    steps: ["だし汁を温める", "豆腐とわかめを入れて煮る", "火を弱めて味噌を溶き入れ、ねぎを散らす"],
  },
  豚汁: {
    ingredients: ["豚バラ肉 150g", "大根 1/4本", "にんじん 1/2本", "ごぼう 1/2本", "こんにゃく 1/2枚", "だし汁 800ml", "味噌 大さじ4"],
    steps: ["具材を食べやすい大きさに切る", "豚肉と野菜をごま油で炒める", "だし汁で煮て、味噌を溶く"],
  },
  わかめスープ: {
    ingredients: ["わかめ 適量", "卵 1個", "鶏がらスープの素 大さじ1", "水 500ml", "ごま油 少々", "白ごま 適量"],
    steps: ["水とスープの素を沸かす", "わかめを入れて煮る", "溶き卵を回し入れ、ごま油をたらす"],
  },
  おでん: {
    ingredients: ["大根 1/2本", "卵 4個", "こんにゃく 1枚", "ちくわ 4本", "だし汁 1000ml", "しょうゆ 大さじ2", "みりん 大さじ2"],
    steps: ["大根を下茹でし、卵をゆでる", "だし汁と調味料を煮立てる", "具材を入れて弱火で1時間煮込む"],
  },
  キムチ鍋: {
    ingredients: ["豚バラ肉 200g", "白菜キムチ 200g", "豆腐 1丁", "長ねぎ 1本", "にら 1/2束", "水 700ml", "鶏がらスープの素 大さじ1"],
    steps: ["土鍋に水とスープの素、キムチを入れて煮立てる", "豚肉と豆腐、ねぎを加える", "火が通ったらにらを入れる"],
  },
};
const DEFAULT_RECIPE = {
  ingredients: ["メイン食材 200g", "玉ねぎ 1個", "しょうゆ 大さじ2", "砂糖 大さじ1", "塩 少々", "サラダ油 適量"],
  steps: ["材料を食べやすい大きさに切る", "フライパンで炒めて火を通す", "調味料を加えて味を調える"],
};

function sampleDescription(dish: string): string {
  const r = RECIPES[dish] ?? DEFAULT_RECIPE;
  return [
    `${dish}の動画です。ご覧いただきありがとうございます！`,
    "",
    "【材料】（2人分）",
    ...r.ingredients.map((i) => `・${i}`),
    "",
    "【作り方】",
    ...r.steps.map((t, n) => `${n + 1}. ${t}`),
    "",
    "チャンネル登録お願いします！",
  ].join("\n");
}
const STYLES = ["プロが教える", "簡単", "10分で作れる", "絶品", "食べ歩き", "大食い", "本格", "時短", "人気店の", "ズボラ"];
const SUFFIX = ["レシピ", "作り方", "を食べてみた", "グルメ", "のコツ"];
const CHANNELS = ["もぐもぐキッチン", "料理研究家ミナ", "食べ歩きTV", "男めし道場", "おうちごはん部", "スイーツラボ"];

function svgThumb(emoji: string, color: string): string {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="270" viewBox="0 0 480 270">` +
    `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${color}"/><stop offset="1" stop-color="#fff5ee"/></linearGradient></defs>` +
    `<rect width="480" height="270" fill="url(#g)"/>` +
    `<text x="240" y="170" font-size="110" text-anchor="middle">${emoji}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function build(): Video[] {
  const videos: Video[] = [];
  let seed = 7;
  const rand = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  for (let i = 0; i < 160; i++) {
    const dish = DISHES[i % DISHES.length];
    const style = STYLES[Math.floor(rand() * STYLES.length)];
    const suffix = SUFFIX[Math.floor(rand() * SUFFIX.length)];
    const title = `【${style}】${dish.name}${suffix} #${i + 1}`;
    const description = sampleDescription(dish.name);
    videos.push({
      videoId: `sample${i}`,
      title,
      channelTitle: CHANNELS[i % CHANNELS.length],
      thumbnailUrl: svgThumb(dish.emoji, dish.color),
      publishedAt: new Date(Date.UTC(2026, 10, 1) - i * 86400000 * 1.7).toISOString(),
      description,
      viewCount: Math.floor(rand() * 900000) + 1000,
      tags: detectTags(title, description),
      recipe: i % 5 === 4 ? { ingredients: [], steps: [] } : extractRecipe(description), // 一部は材料なしの動画として用意
    });
  }
  return videos;
}

let cache: Video[] | null = null;
const all = () => (cache ??= build());

function matches(v: Video, query: string, tag: string): boolean {
  if (tag && !v.tags.includes(tag)) return false;
  return query
    .trim()
    .split(/[\s　]+/)
    .filter(Boolean)
    .every(
      (term) =>
        v.title.toLowerCase().includes(term.toLowerCase()) ||
        v.channelTitle.toLowerCase().includes(term.toLowerCase()) ||
        v.tags.includes(term),
    );
}

export function searchSampleVideos(p: {
  query: string;
  tag: string;
  sort: VideoSort;
  limit: number;
  offset: number;
}): Video[] {
  return all()
    .filter((v) => matches(v, p.query, p.tag))
    .sort((a, b) =>
      p.sort === "view_count"
        ? b.viewCount - a.viewCount
        : b.publishedAt.localeCompare(a.publishedAt),
    )
    .slice(p.offset, p.offset + p.limit);
}

export function countSampleVideos(p: { query: string; tag: string }): number {
  return all().filter((v) => matches(v, p.query, p.tag)).length;
}

