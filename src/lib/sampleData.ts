/**
 * Supabase未設定のローカル開発（NODE_ENV !== "production"）でだけ使う
 * サンプルデータ。SQL関数 `search_videos` / `videos_match` と同じ絞り込み・
 * 並び順を JS で再現している。本番では使われない。
 */
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
];
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
    const description = `${dish.name}の動画です。`;
    videos.push({
      videoId: `sample${i}`,
      title,
      channelTitle: CHANNELS[i % CHANNELS.length],
      thumbnailUrl: svgThumb(dish.emoji, dish.color),
      publishedAt: new Date(Date.UTC(2026, 10, 1) - i * 86400000 * 1.7).toISOString(),
      description,
      viewCount: Math.floor(rand() * 900000) + 1000,
      tags: detectTags(title, description),
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

