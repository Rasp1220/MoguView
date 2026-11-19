/**
 * 買い物リスト用：複数の動画の材料を、同じ食材ごとに合算する。
 * 例）「鶏もも肉 1枚」+「鶏もも肉 2枚」→「鶏もも肉 3枚」
 *     「醤油 大さじ1」+「しょうゆ 大さじ2」→「醤油 大さじ3」
 */
import type { Ingredient } from "./recipe";
import type { Video } from "./types";

// 表記ゆれ（同じ食材とみなす名前）。キーは正規化後の名前。
const SYNONYMS: [string[], string][] = [
  [["しょうゆ", "しょう油", "醤油", "濃口醤油", "濃口しょうゆ", "こいくち醤油"], "醤油"],
  [["たまねぎ", "タマネギ", "玉葱", "玉ねぎ", "新玉ねぎ", "新たまねぎ"], "玉ねぎ"],
  [["にんじん", "ニンジン", "人参"], "にんじん"],
  [["たまご", "タマゴ", "玉子", "卵", "全卵"], "卵"],
  [["しょうが", "ショウガ", "生姜", "おろし生姜", "おろししょうが"], "しょうが"],
  [["にんにく", "ニンニク", "大蒜", "おろしにんにく"], "にんにく"],
  [["じゃがいも", "ジャガイモ", "じゃが芋", "馬鈴薯"], "じゃがいも"],
  [["ごま油", "ゴマ油", "胡麻油"], "ごま油"],
  [["みりん", "ミリン", "本みりん"], "みりん"],
  [["さとう", "砂糖", "上白糖"], "砂糖"],
  [["しお", "塩", "食塩"], "塩"],
  [["料理酒", "日本酒", "酒"], "酒"],
  [["長ねぎ", "長ネギ", "白ねぎ", "白ネギ"], "長ねぎ"],
  [["こしょう", "コショウ", "胡椒", "黒こしょう", "黒コショウ"], "こしょう"],
  [["かたくり粉", "片栗粉"], "片栗粉"],
  [["サラダ油", "油", "食用油"], "サラダ油"],
];
const SYNONYM_MAP = new Map<string, string>(SYNONYMS.flatMap(([names, canon]) => names.map((n) => [n, canon] as const)));

/** 括弧書き（みじん切り 等）や空白を除いた、突き合わせ用の名前。 */
function baseName(name: string): string {
  return name
    .normalize("NFKC")
    .replace(/\([^)]*\)/g, "")
    .replace(/[\s・]+/g, "")
    .trim();
}

export function ingredientKey(name: string): string {
  const base = baseName(name);
  return (SYNONYM_MAP.get(base) ?? base).toLowerCase();
}

function displayName(name: string): string {
  const base = baseName(name) || name.trim();
  return SYNONYM_MAP.get(base) ?? base;
}

interface ParsedAmount {
  value: number;
  unit: string;
  /** 「大さじ1」のように単位が数字の前に来る書き方か */
  prefix: boolean;
}

const NUM = "(\\d+(?:\\.\\d+)?(?:/\\d+)?)";
const PREFIX_RE = new RegExp(`^(大さじ|小さじ|カップ)${NUM}$`);
const SUFFIX_RE = new RegExp(
  `^${NUM}(g|kg|ml|cc|l|個|枚|本|片|束|袋|缶|丁|パック|合|切れ|匹|尾|玉|房|粒|株|かけ|カップ|杯|cm|mm|人分)$`,
  "i",
);

function toNumber(s: string): number {
  if (s.includes("/")) {
    const [a, b] = s.split("/").map(Number);
    return b ? a / b : NaN;
  }
  return Number(s);
}

export function parseAmount(raw: string): ParsedAmount | null {
  const s = raw.normalize("NFKC").replace(/\s+/g, "");
  let m = PREFIX_RE.exec(s);
  if (m) {
    const value = toNumber(m[2]);
    return Number.isFinite(value) ? { value, unit: m[1], prefix: true } : null;
  }
  m = SUFFIX_RE.exec(s);
  if (!m) return null;
  let value = toNumber(m[1]);
  let unit = m[2].toLowerCase();
  if (!Number.isFinite(value)) return null;
  // 単位ちがいで合算できるものはそろえる
  if (unit === "kg") [value, unit] = [value * 1000, "g"];
  else if (unit === "l") [value, unit] = [value * 1000, "ml"];
  else if (unit === "cc") unit = "ml";
  return { value, unit, prefix: false };
}

const FRACTIONS: Record<string, string> = { "0.25": "1/4", "0.33": "1/3", "0.5": "1/2", "0.67": "2/3", "0.75": "3/4" };

function formatValue(v: number): string {
  const r = Math.round(v * 100) / 100;
  if (r < 1 && FRACTIONS[String(r)]) return FRACTIONS[String(r)];
  return String(r);
}

function formatAmount(a: ParsedAmount): string {
  return a.prefix ? `${a.unit}${formatValue(a.value)}` : `${formatValue(a.value)}${a.unit}`;
}

export interface ShoppingItem {
  key: string;
  name: string;
  amount: string;
  /** この食材を使う動画の数 */
  count: number;
}

export function mergeIngredients(videos: Video[]): ShoppingItem[] {
  const groups = new Map<string, { name: string; amounts: string[]; count: number }>();
  for (const video of videos) {
    const seenInVideo = new Set<string>();
    for (const ing of video.recipe?.ingredients ?? ([] as Ingredient[])) {
      const key = ingredientKey(ing.name);
      if (!key) continue;
      let g = groups.get(key);
      if (!g) {
        g = { name: displayName(ing.name), amounts: [], count: 0 };
        groups.set(key, g);
      }
      if (!seenInVideo.has(key)) {
        seenInVideo.add(key);
        g.count++;
      }
      if (ing.amount) g.amounts.push(ing.amount);
    }
  }

  return [...groups.entries()].map(([key, g]) => ({
    key,
    name: g.name,
    amount: mergeAmounts(g.amounts),
    count: g.count,
  }));
}

function mergeAmounts(amounts: string[]): string {
  if (amounts.length === 0) return "";
  if (amounts.length === 1) return amounts[0];

  const sums = new Map<string, ParsedAmount>();
  const others: string[] = [];
  for (const raw of amounts) {
    const p = parseAmount(raw);
    if (!p) {
      if (!others.includes(raw)) others.push(raw);
      continue;
    }
    const k = `${p.prefix ? "p" : "s"}:${p.unit}`;
    const cur = sums.get(k);
    if (cur) cur.value += p.value;
    else sums.set(k, { ...p });
  }
  return [...[...sums.values()].map(formatAmount), ...others].join("＋");
}

/** 共有（LINE・コピー）用のテキスト。 */
export function shoppingListText(items: { name: string; amount: string; checked?: boolean }[]): string {
  const lines = items.filter((i) => !i.checked).map((i) => `□ ${i.name}${i.amount ? `　${i.amount}` : ""}`);
  return ["🛒 買い物リスト（モグビュー）", ...lines].join("\n");
}
