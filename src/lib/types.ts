import type { Recipe } from "./recipe";

export interface Video {
  videoId: string;
  title: string;
  channelTitle: string;
  thumbnailUrl: string;
  publishedAt: string;
  description: string;
  viewCount: number;
  tags: string[];
  /** 説明文から抜き出した材料・作り方。null は未取得（バッチの補完待ち）。 */
  recipe: Recipe | null;
}

export type VideoSort = "view_count" | "published_at";
