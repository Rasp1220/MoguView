import { getReadClient } from "./supabase";
import { searchSampleVideos, countSampleVideos } from "./sampleData";
import type { Video, VideoSort } from "./types";

interface VideoRow {
  video_id: string;
  title: string;
  channel_title: string;
  thumbnail_url: string;
  description: string;
  published_at: string | null;
  view_count: number;
  tags: string[] | null;
}

function toVideo(row: VideoRow): Video {
  return {
    videoId: row.video_id,
    title: row.title,
    channelTitle: row.channel_title,
    thumbnailUrl: row.thumbnail_url,
    publishedAt: row.published_at ?? "",
    description: row.description,
    viewCount: Number(row.view_count) || 0,
    tags: row.tags ?? [],
  };
}

export interface SearchParams {
  /** 空白区切りのキーワード。タイトル部分一致 or タグ一致（AND）。 */
  query?: string;
  /** タグでの絞り込み（完全一致）。 */
  tag?: string;
  sort?: VideoSort;
  limit?: number;
  offset?: number;
}

// Supabase未設定のローカル開発時だけ、サンプルデータで画面を確認できるようにする。
function shouldUseSampleData(): boolean {
  return !getReadClient() && process.env.NODE_ENV !== "production";
}

export async function searchVideos(params: SearchParams): Promise<Video[]> {
  const { query = "", tag = "", sort = "view_count", limit = 48, offset = 0 } = params;
  if (shouldUseSampleData()) return searchSampleVideos({ query, tag, sort, limit, offset });

  const supabase = getReadClient();
  if (!supabase) throw new Error("Supabaseの接続情報が設定されていません");

  const { data, error } = await supabase.rpc("search_videos", {
    search_query: query || null,
    search_tag: tag || null,
    sort_by: sort,
    result_limit: limit,
    result_offset: offset,
  });
  if (error) throw new Error(error.message);
  return ((data ?? []) as VideoRow[]).map(toVideo);
}

export async function countVideos(params: Pick<SearchParams, "query" | "tag">): Promise<number> {
  const { query = "", tag = "" } = params;
  if (shouldUseSampleData()) return countSampleVideos({ query, tag });

  const supabase = getReadClient();
  if (!supabase) throw new Error("Supabaseの接続情報が設定されていません");

  const { data, error } = await supabase.rpc("count_videos", {
    search_query: query || null,
    search_tag: tag || null,
  });
  if (error) throw new Error(error.message);
  return typeof data === "number" ? data : 0;
}
