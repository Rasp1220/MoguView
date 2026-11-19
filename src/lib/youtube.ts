/**
 * YouTube Data API v3 の呼び出し（サーバー専用・取り込みバッチだけが使う）。
 *
 * クォータ: search.list = 100ユニット/回（最大50件）、videos.list = 1ユニット/回
 * （最大50件）。1日の既定クォータは10,000ユニット。
 */
const SEARCH_URL = "https://www.googleapis.com/youtube/v3/search";
const VIDEOS_URL = "https://www.googleapis.com/youtube/v3/videos";

export const SEARCH_UNITS = 100;
export const VIDEOS_UNITS = 1;
export const VIDEOS_BATCH = 50;

const QUOTA_REASONS = new Set(["quotaExceeded", "dailyLimitExceeded", "rateLimitExceeded"]);

export class YouTubeError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly reason: string | null,
  ) {
    super(message);
  }

  /** 1日のクォータを使い切った（翌日のリセットまで再開できない）。 */
  get isQuotaExceeded(): boolean {
    // 理由コードはAPIの種類で変わる（"quotaExceeded" / "dailyLimitExceeded" /
    // "rateLimitExceeded" など）。検索の1日上限は "Quota exceeded for quota metric
    // 'Search Queries' ..." というメッセージで返るため、文言でも判定する。
    if (this.reason && QUOTA_REASONS.has(this.reason)) return true;
    return (this.status === 403 || this.status === 429) && /quota/i.test(this.message);
  }
}

async function request(url: URL): Promise<any> {
  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new YouTubeError(
      body?.error?.message ?? "YouTube APIの呼び出しに失敗しました",
      res.status,
      body?.error?.errors?.[0]?.reason ?? null,
    );
  }
  return res.json();
}

export interface SearchItem {
  videoId: string;
  title: string;
  channelTitle: string;
  thumbnailUrl: string;
  publishedAt: string;
  description: string;
}

export async function searchPage(opts: {
  query: string;
  order: string;
  pageToken: string | null;
  apiKey: string;
}): Promise<{ items: SearchItem[]; nextPageToken: string | null }> {
  const url = new URL(SEARCH_URL);
  url.searchParams.set("part", "snippet");
  url.searchParams.set("q", opts.query);
  url.searchParams.set("type", "video");
  url.searchParams.set("order", opts.order);
  url.searchParams.set("maxResults", "50");
  url.searchParams.set("regionCode", "JP");
  url.searchParams.set("relevanceLanguage", "ja");
  url.searchParams.set("videoEmbeddable", "true");
  url.searchParams.set("key", opts.apiKey);
  if (opts.pageToken) url.searchParams.set("pageToken", opts.pageToken);

  const data = await request(url);
  const items: SearchItem[] = (data.items ?? [])
    .map((item: any) => ({
      videoId: item.id?.videoId as string,
      title: (item.snippet?.title ?? "") as string,
      channelTitle: (item.snippet?.channelTitle ?? "") as string,
      thumbnailUrl: (item.snippet?.thumbnails?.high?.url ??
        item.snippet?.thumbnails?.medium?.url ??
        item.snippet?.thumbnails?.default?.url ??
        "") as string,
      publishedAt: (item.snippet?.publishedAt ?? "") as string,
      description: (item.snippet?.description ?? "") as string,
    }))
    .filter((i: SearchItem) => i.videoId && i.thumbnailUrl);
  return { items, nextPageToken: data.nextPageToken ?? null };
}

export interface VideoDetails {
  viewCount: number;
  categoryId: number | null;
  durationSeconds: number | null;
  /** videos.list の説明文（search.list のものと違い全文）。材料・作り方の抽出に使う。 */
  description: string;
}

export function parseIso8601Duration(duration: string | undefined | null): number | null {
  if (!duration) return null;
  const m = /^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/.exec(duration);
  if (!m || (!m[1] && !m[2] && !m[3] && !m[4])) return null;
  return Number(m[1] ?? 0) * 86400 + Number(m[2] ?? 0) * 3600 + Number(m[3] ?? 0) * 60 + Number(m[4] ?? 0);
}

/** 再生数・カテゴリ・長さをまとめて取得（50件/回・1ユニット）。 */
export async function fetchVideoDetails(
  videoIds: string[],
  apiKey: string,
): Promise<Map<string, VideoDetails>> {
  const out = new Map<string, VideoDetails>();
  for (let i = 0; i < videoIds.length; i += VIDEOS_BATCH) {
    const url = new URL(VIDEOS_URL);
    url.searchParams.set("part", "statistics,snippet,contentDetails");
    url.searchParams.set("id", videoIds.slice(i, i + VIDEOS_BATCH).join(","));
    url.searchParams.set("key", apiKey);
    const data = await request(url);
    for (const item of data.items ?? []) {
      const views = Number(item.statistics?.viewCount ?? 0);
      const cat = Number(item.snippet?.categoryId);
      out.set(item.id, {
        viewCount: Number.isFinite(views) ? views : 0,
        categoryId: Number.isFinite(cat) ? cat : null,
        durationSeconds: parseIso8601Duration(item.contentDetails?.duration),
        description: (item.snippet?.description ?? "") as string,
      });
    }
  }
  return out;
}
