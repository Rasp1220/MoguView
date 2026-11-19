import { GACHA_ROLES, type GachaRole } from "./gachaRoles";
import { hasIngredients } from "./recipe";
import type { Video } from "./types";
import { searchVideos } from "./videos";

const POOL_SIZE = 20;
const KEYWORD_TRIES = 4;

function shuffle<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * 指定した役割の動画を1本ランダムに引く。
 * 料理キーワードをランダムに選び、人気順の上位の中からランダムな位置の20件を候補にする。
 * 材料が読み取れている動画があれば優先する（そのまま買い物リストに入れられるため）。
 */
export async function drawVideo(role: GachaRole, excludeIds: Set<string>): Promise<Video | null> {
  const def = GACHA_ROLES.find((r) => r.role === role);
  if (!def) return null;

  for (const keyword of shuffle(def.keywords).slice(0, KEYWORD_TRIES)) {
    const offset = Math.floor(Math.random() * 40);
    let pool = await searchVideos({ query: keyword, sort: "view_count", limit: POOL_SIZE, offset }).catch(() => []);
    if (pool.length === 0 && offset > 0) {
      pool = await searchVideos({ query: keyword, sort: "view_count", limit: POOL_SIZE }).catch(() => []);
    }
    const candidates = pool.filter((v) => !excludeIds.has(v.videoId));
    if (candidates.length === 0) continue;
    const withRecipe = candidates.filter((v) => hasIngredients(v.recipe));
    const from = withRecipe.length > 0 ? withRecipe : candidates;
    return from[Math.floor(Math.random() * from.length)];
  }
  return null;
}
