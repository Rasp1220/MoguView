/**
 * YouTube の説明文から「材料」「作り方」を抜き出す。
 *
 * 取り込みバッチ（保存時）とサンプルデータの両方から使う純粋関数。
 * 説明文の書き方は動画ごとにバラバラなので、よくある書式だけを拾い、
 * 読み取れなければ空のレシピ（材料なし）を返す。
 *
 *   【材料】（2人分）            ← 見出し（■材料 / ▼材料 / 材料： なども可）
 *   ・鶏もも肉 1枚               ← 「名前 分量」「名前…分量」「名前：分量」「名前（分量）」
 *   ・醤油 大さじ1
 *
 *   【作り方】                   ← 見出し（手順 / つくり方 なども可）
 *   1. 鶏肉を一口大に切る
 */

export interface Ingredient {
  name: string;
  amount: string;
}

export interface Recipe {
  ingredients: Ingredient[];
  steps: string[];
}

export const EMPTY_RECIPE: Recipe = { ingredients: [], steps: [] };

const MAX_INGREDIENTS = 40;
const MAX_STEPS = 15;
const MAX_STEP_LENGTH = 140;
const MAX_NAME_LENGTH = 24;

const norm = (line: string) => line.normalize("NFKC").replace(/　/g, " ").trim();
const stripLead = (s: string) => s.replace(/^[\s\p{P}\p{S}️]*/u, "");

const SECTION_WORDS = {
  ingredients: "材料|食材|ざいりょう",
  steps: "作り方|作りかた|つくり方|つくりかた|手順|作成方法|How to",
} as const;

type Kind = keyof typeof SECTION_WORDS;

/** 「材料」「作り方」の見出し行か。見出しの後ろに続けて書かれた内容（inline）も返す。 */
function parseHeader(line: string): { kind: Kind; inline: string } | null {
  const s = stripLead(line);
  for (const kind of Object.keys(SECTION_WORDS) as Kind[]) {
    const m = new RegExp(`^(?:${SECTION_WORDS[kind]})`, "i").exec(s);
    if (!m) continue;
    let rest = s.slice(m[0].length);
    // 「材料は冷蔵庫にあるものでOK」「食材たっぷり」のような文章は見出しにしない
    if (/^[぀-ゟ]/.test(rest)) return null;
    const closers = /^[】\]＞>」』\s]+/;
    rest = rest.replace(closers, "").replace(/^\([^)]*\)/, "").replace(closers, "");
    const colon = /^[:]\s*/.exec(rest);
    if (colon) return { kind, inline: rest.slice(colon[0].length).trim() };
    // 「2人分」「4人前」程度の付記だけなら見出し。「材料費500円」のような語は見出しにしない
    if (/^[\p{P}\p{S}\s\d約人分前個枚本皿台号用~]*$/u.test(rest)) return { kind, inline: "" };
    return null;
  }
  return null;
}

const STOP_RE =
  /(https?:\/\/|www\.|^\d{1,2}:\d{2}|^[\s\p{P}\p{S}]*(材料|食材|ポイント|コツ|ワンポイント|チャンネル|関連|お仕事|ご依頼|お問い合わせ|SNS|Instagram|Twitter|TikTok|BGM|使用|概要|#))/iu;

const UNITS =
  "g|kg|ml|cc|l|個|枚|本|片|束|袋|缶|丁|パック|合|切れ|匹|尾|玉|房|粒|株|かけ|カップ|杯|cm|mm|人分|cup|tbsp|tsp";
const AMOUNT_WORDS = "適量|少々|ひとつまみ|お好みで|お好み|適宜|少量|大さじ|小さじ|カップ";
const LOOKS_LIKE_AMOUNT = new RegExp(`\\d|${AMOUNT_WORDS}`);

const BULLET = /^(?:[・･•●○◆◇■□▪▫★☆▶►*＊※✓✔♦]|[-–—]|\d+[.)、]|[❶-➓])\s*/u;
const GROUP_MARK = /^[■□◆◇▼▽▲△★☆▶►【[<＜〈「『(]/;

/** 1行を材料（名前と分量）に分解する。見出し的な行は "group"、材料でなければ null。 */
function parseIngredient(raw: string): Ingredient | "group" | null {
  let s = raw.trim();
  if (!s) return null;
  const hasAmount = LOOKS_LIKE_AMOUNT.test(s);
  // 「■タレ」「【A】」「(調味料)」のような小見出し
  if (!hasAmount && s.length <= 12 && (GROUP_MARK.test(s) || /[:]$/.test(s))) return "group";
  if (/^[A-E][.):]?$/.test(s)) return "group";

  s = s.replace(BULLET, "").replace(/^[A-E]\s+/, "");
  s = s.replace(BULLET, "");
  if (!s || /[。！？!?]|https?:/.test(s)) return null;

  let name = s;
  let amount = "";

  const delim = /\s*(?:\.{2,}|[:─━―]+)\s*/.exec(s);
  const paren = /^(.+?)\s*\(([^()]*)\)$/.exec(s);
  const spaced = new RegExp(
    `^(.+?)\\s+((?:${AMOUNT_WORDS})?\\s*[\\d./]*.*)$`,
  ).exec(s);
  const glued = new RegExp(
    `^(.+?)((?:大さじ|小さじ|カップ)\\s*[\\d./]+.*|[\\d./]+\\s*(?:${UNITS}).*)$`,
    "i",
  ).exec(s);

  if (delim && delim.index > 0) {
    name = s.slice(0, delim.index);
    amount = s.slice(delim.index + delim[0].length);
  } else if (spaced && LOOKS_LIKE_AMOUNT.test(spaced[2]) && /^(?:\d|各|適|少|ひとつ|お好|大さじ|小さじ|カップ)/.test(spaced[2])) {
    // 「鶏もも肉 1枚(300g)」のように分量のあとに括弧が付く書き方もここで拾う
    name = spaced[1];
    amount = spaced[2];
  } else if (glued) {
    name = glued[1];
    amount = glued[2];
  } else if (paren && LOOKS_LIKE_AMOUNT.test(paren[2])) {
    name = paren[1];
    amount = paren[2];
  }

  name = name.replace(/[:\s]+$/, "").trim();
  amount = amount.trim();
  if (!name || name.length > MAX_NAME_LENGTH) return null;
  // 分量らしくない長い文字列は、材料行ではなく文章とみなす
  if (amount && (amount.length > 24 || !LOOKS_LIKE_AMOUNT.test(amount))) return null;
  return { name, amount };
}

function splitInline(text: string): string[] {
  return text
    .split(/[、,，](?![^(]*\))/)
    .map((t) => t.trim())
    .filter(Boolean);
}

const STEP_NUMBER = /^(?:\(?\d{1,2}[.)、:]?\)?|[❶-➓])\s*/;

export function extractRecipe(description: string | null | undefined): Recipe {
  if (!description) return { ingredients: [], steps: [] };
  const lines = description.replace(/\r/g, "").split("\n").map(norm);

  const ingredients: Ingredient[] = [];
  const steps: string[] = [];
  const seen = new Set<string>();
  let mode: Kind | null = null;
  let ingredientsDone = false;
  let stepsDone = false;

  const addIngredient = (text: string) => {
    const item = parseIngredient(text);
    if (!item || item === "group") return;
    if (seen.has(item.name) || ingredients.length >= MAX_INGREDIENTS) return;
    seen.add(item.name);
    ingredients.push(item);
  };
  const addStep = (text: string) => {
    const step = text.replace(STEP_NUMBER, "").trim();
    if (step.length < 2 || steps.length >= MAX_STEPS) return;
    steps.push(step.slice(0, MAX_STEP_LENGTH));
  };
  const close = () => {
    if (mode === "ingredients") ingredientsDone = true;
    if (mode === "steps") stepsDone = true;
    mode = null;
  };

  for (const line of lines) {
    const header = parseHeader(line);
    if (header) {
      close();
      if (header.kind === "ingredients" && !ingredientsDone && ingredients.length === 0) {
        mode = "ingredients";
        for (const part of splitInline(header.inline)) addIngredient(part);
      } else if (header.kind === "steps" && !stepsDone && steps.length === 0) {
        mode = "steps";
        if (header.inline) addStep(header.inline);
      }
      continue;
    }
    if (!mode) continue;

    if (line === "") {
      // 見出しの直後の空行は読み飛ばし、中身を拾ったあとの空行でセクションを閉じる
      if ((mode === "ingredients" && ingredients.length > 0) || (mode === "steps" && steps.length > 0)) close();
      continue;
    }
    if (STOP_RE.test(line)) {
      close();
      continue;
    }
    if (mode === "ingredients") {
      for (const part of splitInline(line)) addIngredient(part);
    } else {
      addStep(line);
    }
  }

  return { ingredients, steps };
}

export function hasIngredients(recipe: Recipe | null | undefined): boolean {
  return !!recipe && recipe.ingredients.length > 0;
}
