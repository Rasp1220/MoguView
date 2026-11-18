/**
 * 取り込み対象の検索クエリ一覧（サーバー専用・バッチだけが使う）。
 *
 * 「料理キーワード × 切り口 × 並び順」の組み合わせを `fetch_queue` に登録し、
 * 1ページずつ（ページトークンを保存しながら）日をまたいで消化する。
 * YouTube の search.list は1クエリあたり最大500件程度で頭打ちになるため、
 * キーワード・切り口・並び順（関連度/新着/再生数）を掛け合わせて
 * 5万件に届くだけの“入口”を用意している。
 */

export const SEARCH_KEYWORDS: string[] = [
  // 和食
  "寿司", "天ぷら", "とんかつ", "肉じゃが", "味噌汁", "刺身", "親子丼", "牛丼", "うどん", "そば",
  "唐揚げ", "お好み焼き", "たこ焼き", "すき焼き", "焼き魚", "煮物", "おにぎり", "和食",
  // 中華
  "中華料理", "餃子", "麻婆豆腐", "チャーハン", "小籠包", "エビチリ", "酢豚", "天津飯", "回鍋肉", "春巻き",
  // ラーメン
  "ラーメン", "つけ麺", "家系ラーメン", "二郎系", "担々麺", "油そば", "味噌ラーメン", "豚骨ラーメン",
  // イタリアン
  "イタリアン", "パスタ", "ピザ", "カルボナーラ", "ペペロンチーノ", "ボロネーゼ", "リゾット", "ラザニア",
  // スイーツ
  "スイーツ", "ケーキ", "プリン", "パンケーキ", "クレープ", "チーズケーキ", "パフェ", "和菓子", "アイス", "タルト", "ドーナツ", "クッキー",
  // その他
  "ハンバーグ", "オムライス", "カレー", "シチュー", "韓国料理", "焼肉", "焼き鳥", "サンドイッチ", "パン", "カフェ", "居酒屋 おつまみ", "大食い",
];

export const QUERY_TEMPLATES: string[] = ["{k} レシピ", "{k} 作り方", "{k} 食べ歩き グルメ"];

export const SORT_ORDERS = ["relevance", "date", "viewCount"] as const;
export type SearchOrder = (typeof SORT_ORDERS)[number];

export interface QueueSeed {
  id: string;
  query: string;
  sort_order: SearchOrder;
}

export function buildQueueSeeds(): QueueSeed[] {
  const seeds: QueueSeed[] = [];
  for (const order of SORT_ORDERS) {
    for (const template of QUERY_TEMPLATES) {
      for (const keyword of SEARCH_KEYWORDS) {
        const query = template.replace("{k}", keyword);
        seeds.push({ id: `${query}|${order}`, query, sort_order: order });
      }
    }
  }
  return seeds;
}

// 料理と無関係な YouTube カテゴリ（10=音楽, 17=スポーツ, 20=ゲーム, 25=ニュース）。
export const EXCLUDED_CATEGORY_IDS = new Set([10, 17, 20, 25]);

// タグが1つも付かなかった動画でも、これを含めば料理動画とみなす。
export const GENERIC_FOOD_WORDS = [
  "料理", "レシピ", "作り方", "グルメ", "食べ", "ご飯", "飯", "ごはん", "メシ", "美味", "うまい",
  "おいしい", "クッキング", "ランチ", "ディナー", "夕食", "朝食", "弁当", "お弁当", "食堂", "ベーカリー",
];
