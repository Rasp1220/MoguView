/** 今日の献立ガチャの「役割」（主菜・副菜・汁物）と、引くときの料理キーワード。 */
export type GachaRole = "main" | "side" | "soup";

export interface GachaRoleDef {
  role: GachaRole;
  label: string;
  emoji: string;
  /** どれか1つをランダムに選び、タイトル/タグの部分一致で動画を探す */
  keywords: string[];
}

export const GACHA_ROLES: GachaRoleDef[] = [
  {
    role: "main",
    label: "主菜",
    emoji: "🍖",
    keywords: ["ハンバーグ", "唐揚げ", "生姜焼き", "麻婆豆腐", "餃子", "カレー", "肉じゃが", "照り焼き", "オムライス", "親子丼", "パスタ", "鯖"],
  },
  {
    role: "side",
    label: "副菜",
    emoji: "🥗",
    keywords: ["ポテトサラダ", "きんぴら", "ほうれん草", "サラダ", "卵焼き", "浅漬け", "ひじき", "冷奴", "マリネ", "ナムル"],
  },
  {
    role: "soup",
    label: "汁物",
    emoji: "🍲",
    keywords: ["味噌汁", "スープ", "豚汁", "コンソメ", "中華スープ", "けんちん汁", "ポタージュ"],
  },
];

export const GACHA_ROLE_IDS = GACHA_ROLES.map((r) => r.role);
