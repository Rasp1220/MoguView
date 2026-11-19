/**
 * 季節の料理特集。月ごとに2つの特集を持ち、キーワードのどれかにタイトル/タグが
 * 一致する動画を人気順に並べる。トップページには「今月」の特集を出す。
 */
export interface SeasonFeature {
  id: string;
  title: string;
  emoji: string;
  description: string;
  /** どれか1つに一致すればよい（OR） */
  keywords: string[];
}

export interface SeasonMonth {
  month: number;
  label: string;
  features: SeasonFeature[];
}

export const SEASONS: SeasonMonth[] = [
  {
    month: 1,
    label: "新年・寒さ本番",
    features: [
      { id: "osechi", title: "おせち・お雑煮", emoji: "🎍", description: "お正月の定番を手作りで", keywords: ["おせち", "お雑煮", "雑煮", "伊達巻"] },
      { id: "nanakusa", title: "七草がゆ・おかゆ", emoji: "🥣", description: "食べ疲れた胃にやさしい一杯", keywords: ["七草", "おかゆ", "お粥"] },
    ],
  },
  {
    month: 2,
    label: "節分・バレンタイン",
    features: [
      { id: "ehomaki", title: "恵方巻・巻き寿司", emoji: "🍣", description: "節分に作りたい巻き寿司", keywords: ["恵方巻", "巻き寿司", "太巻き"] },
      { id: "valentine", title: "バレンタインのチョコ菓子", emoji: "🍫", description: "手作りチョコ・ガトーショコラ", keywords: ["バレンタイン", "チョコ", "ガトーショコラ"] },
    ],
  },
  {
    month: 3,
    label: "ひなまつり・春の入り口",
    features: [
      { id: "hinamatsuri", title: "ひなまつりごはん", emoji: "🎎", description: "ちらし寿司・はまぐりのお吸い物", keywords: ["ちらし寿司", "ひなまつり", "ひな祭り", "はまぐり"] },
      { id: "whiteday", title: "ホワイトデーのお菓子", emoji: "🍪", description: "クッキー・マカロンでお返し", keywords: ["ホワイトデー", "クッキー", "マカロン"] },
    ],
  },
  {
    month: 4,
    label: "お花見・春野菜",
    features: [
      { id: "hanami", title: "お花見弁当", emoji: "🌸", description: "持ち寄りにも映えるお弁当", keywords: ["お花見", "花見", "お弁当", "弁当"] },
      { id: "spring-veg", title: "春野菜レシピ", emoji: "🥬", description: "春キャベツ・新玉ねぎ・たけのこ", keywords: ["春キャベツ", "新玉ねぎ", "たけのこ", "菜の花"] },
    ],
  },
  {
    month: 5,
    label: "GW・初夏",
    features: [
      { id: "bbq", title: "BBQ・アウトドア飯", emoji: "🔥", description: "GWのバーベキューに", keywords: ["BBQ", "バーベキュー", "キャンプ", "アウトドア"] },
      { id: "early-summer", title: "新じゃが・初夏の味", emoji: "🥔", description: "新じゃが・アスパラ・そら豆", keywords: ["新じゃが", "アスパラ", "そら豆", "新玉"] },
    ],
  },
  {
    month: 6,
    label: "梅雨・梅仕事",
    features: [
      { id: "ume", title: "梅仕事", emoji: "🫙", description: "梅干し・梅シロップ・梅酒", keywords: ["梅干し", "梅シロップ", "梅酒", "梅仕事"] },
      { id: "summer-veg", title: "夏野菜カレー・煮込み", emoji: "🍛", description: "なす・トマト・ズッキーニ", keywords: ["夏野菜", "ラタトゥイユ", "なす", "トマト"] },
    ],
  },
  {
    month: 7,
    label: "夏本番",
    features: [
      { id: "cold-noodle", title: "冷たい麺", emoji: "🍜", description: "そうめん・冷やし中華・冷麺", keywords: ["そうめん", "冷やし中華", "冷麺", "ざるそば", "冷やしうどん"] },
      { id: "iced", title: "かき氷・冷たいスイーツ", emoji: "🍧", description: "かき氷・アイス・ゼリー", keywords: ["かき氷", "アイス", "ゼリー", "シャーベット"] },
    ],
  },
  {
    month: 8,
    label: "猛暑・夏バテ対策",
    features: [
      { id: "stamina", title: "スタミナ飯", emoji: "💪", description: "うなぎ・豚キムチ・ニンニク料理", keywords: ["スタミナ", "うなぎ", "鰻", "豚キムチ", "ガーリック"] },
      { id: "camp", title: "キャンプ飯・BBQ", emoji: "⛺", description: "夏休みのアウトドアごはん", keywords: ["キャンプ", "BBQ", "バーベキュー", "ダッチオーブン"] },
    ],
  },
  {
    month: 9,
    label: "お月見・秋の入り口",
    features: [
      { id: "tsukimi", title: "お月見", emoji: "🌕", description: "月見団子・月見バーガー・月見うどん", keywords: ["月見", "団子", "お団子"] },
      { id: "autumn-taste", title: "秋の味覚", emoji: "🍂", description: "さんま・栗・きのこ・秋鮭", keywords: ["さんま", "栗", "きのこ", "秋鮭", "松茸"] },
    ],
  },
  {
    month: 10,
    label: "ハロウィン・実りの秋",
    features: [
      { id: "halloween", title: "ハロウィン", emoji: "🎃", description: "かぼちゃ・仮装ごはん・お菓子", keywords: ["ハロウィン", "かぼちゃ", "パンプキン"] },
      { id: "new-rice", title: "新米・さつまいも・栗", emoji: "🍠", description: "栗ご飯・焼き芋・スイートポテト", keywords: ["新米", "栗ご飯", "さつまいも", "焼き芋", "スイートポテト"] },
    ],
  },
  {
    month: 11,
    label: "鍋の季節",
    features: [
      { id: "nabe", title: "あったか鍋・おでん", emoji: "🍲", description: "キムチ鍋・寄せ鍋・おでんで温まる", keywords: ["鍋", "おでん", "しゃぶしゃぶ", "すき焼き"] },
      { id: "stew", title: "シチュー・煮込み", emoji: "🥘", description: "シチュー・ポトフ・豚汁でほっこり", keywords: ["シチュー", "ポトフ", "豚汁", "ビーフシチュー", "煮込み"] },
    ],
  },
  {
    month: 12,
    label: "クリスマス・年越し",
    features: [
      { id: "xmas", title: "クリスマスごちそう", emoji: "🎄", description: "ローストチキン・ケーキ・パーティー料理", keywords: ["クリスマス", "ローストチキン", "ローストビーフ", "ブッシュドノエル"] },
      { id: "toshikoshi", title: "年越しそば・おせち準備", emoji: "🎍", description: "年越しそば・黒豆・数の子・伊達巻", keywords: ["年越しそば", "おせち", "黒豆", "伊達巻", "年越し"] },
    ],
  },
];

/** 日本時間の「今月」(1〜12)。サーバーのタイムゾーンに依存しない。 */
export function currentMonthJst(now: Date = new Date()): number {
  return new Date(now.getTime() + 9 * 3600 * 1000).getUTCMonth() + 1;
}

export function getSeason(month: number): SeasonMonth {
  return SEASONS.find((s) => s.month === month) ?? SEASONS[0];
}
