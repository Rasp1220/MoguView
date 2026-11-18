import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase";
import { detectTags } from "@/lib/tags";
import {
  EXCLUDED_CATEGORY_IDS,
  GENERIC_FOOD_WORDS,
  buildQueueSeeds,
} from "@/lib/fetchPlan";
import {
  SEARCH_UNITS,
  VIDEOS_BATCH,
  VIDEOS_UNITS,
  YouTubeError,
  fetchVideoDetails,
  searchPage,
} from "@/lib/youtube";

/**
 * `videos` テーブルを埋める唯一の入り口（サイト側はYouTube APIを呼ばない）。
 *
 * 仕組み（何日かけて少しずつ5万件に近づける）:
 *  1. `fetch_queue` に「検索語 × 並び順」を登録（初回のみ。以降は既存行を触らない）
 *  2. 進捗の浅い（pages_fetched が少ない）キューから順に、1回の呼び出しで
 *     `budget` ユニットに達するまで search.list を1ページずつ進める
 *  3. 新規動画だけ videos.list で再生数/カテゴリ/長さを取得し、タグを自動付与して upsert
 *  4. 次ページが無い、または新規がほぼ出なくなったキューは done にして以降は飛ばす
 *  5. 1日のクォータ超過（quotaExceeded）を検知したら即停止し、翌日の実行で再開
 *
 * 呼び出し: `GET /api/cron/fetch-videos?budget=2400`
 *   （Authorization: Bearer $CRON_SECRET）。GitHub Actions が1日に数回ループで呼ぶ。
 */
export const dynamic = "force-dynamic";
export const maxDuration = 300;

const DEFAULT_BUDGET = 2400; // 1回の呼び出しで使うユニット上限（≒20ページ）
const MAX_BUDGET = 9500; // 1日クォータ10,000に対する安全上限
const DESCRIPTION_MAX_LENGTH = 150; // DB容量節約のため説明文は先頭150文字だけ保存
// 1ページ（最大50件）のうち新規がこれ未満なら、そのキューは掘り尽くしたとみなす
const MIN_NEW_PER_PAGE = 3;

interface QueueRow {
  id: string;
  query: string;
  sort_order: string;
  next_page_token: string | null;
  pages_fetched: number;
  videos_added: number;
}

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ error: "サーバーにCRON_SECRETが設定されていません" }, { status: 500 });
  }
  if (request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "認証に失敗しました" }, { status: 401 });
  }
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "サーバーにYOUTUBE_API_KEYが設定されていません" }, { status: 500 });
  }
  const supabase = getAdminClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY が設定されていません" },
      { status: 500 },
    );
  }

  const budgetParam = Number(request.nextUrl.searchParams.get("budget"));
  const budget = Math.min(
    Number.isFinite(budgetParam) && budgetParam > 0 ? budgetParam : DEFAULT_BUDGET,
    MAX_BUDGET,
  );
  const maxVideos = Number(process.env.MAX_VIDEOS) > 0 ? Number(process.env.MAX_VIDEOS) : 50000;

  // 目標件数に達していれば何もしない
  const { count: currentCount, error: countError } = await supabase
    .from("videos")
    .select("video_id", { count: "exact", head: true });
  if (countError) return NextResponse.json({ error: countError.message }, { status: 500 });
  if ((currentCount ?? 0) >= maxVideos) {
    return NextResponse.json({ done: true, reason: `目標の${maxVideos}件に到達済みです`, totalVideos: currentCount });
  }

  // 1) キューの初期登録（既存行は触らない = 進捗を保持）
  const { count: queueCount } = await supabase
    .from("fetch_queue")
    .select("id", { count: "exact", head: true });
  const seeds = buildQueueSeeds();
  if ((queueCount ?? 0) < seeds.length) {
    const { error } = await supabase
      .from("fetch_queue")
      .upsert(seeds, { onConflict: "id", ignoreDuplicates: true });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // 2) 進捗の浅い順（同順位は最終取得が古い順）に必要な数だけ取り出す
  const maxPages = Math.floor(budget / (SEARCH_UNITS + VIDEOS_UNITS));
  const { data: queueRows, error: queueError } = await supabase
    .from("fetch_queue")
    .select("id, query, sort_order, next_page_token, pages_fetched, videos_added")
    .eq("done", false)
    .order("pages_fetched", { ascending: true })
    .order("last_fetched_at", { ascending: true, nullsFirst: true })
    .limit(maxPages);
  if (queueError) return NextResponse.json({ error: queueError.message }, { status: 500 });

  const queue = (queueRows ?? []) as QueueRow[];
  if (queue.length === 0) {
    return NextResponse.json({
      done: true,
      reason: "すべての検索キューを取得し終えました",
      totalVideos: currentCount,
    });
  }

  let unitsUsed = 0;
  let pagesProcessed = 0;
  let added = 0;
  let stopReason: string | null = null;
  let quotaExhausted = false;

  for (const row of queue) {
    if (unitsUsed + SEARCH_UNITS + VIDEOS_UNITS > budget) {
      stopReason = "budget";
      break;
    }

    try {
      const { items, nextPageToken } = await searchPage({
        query: row.query,
        order: row.sort_order,
        pageToken: row.next_page_token,
        apiKey,
      });
      unitsUsed += SEARCH_UNITS;

      // 既に保存済みの動画は videos.list を呼ばず再保存もしない（クォータ節約）
      const ids = items.map((i) => i.videoId);
      const existing = new Set<string>();
      if (ids.length > 0) {
        const { data, error } = await supabase.from("videos").select("video_id").in("video_id", ids);
        if (error) throw new Error(error.message);
        for (const r of data ?? []) existing.add(r.video_id as string);
      }
      const fresh = items.filter((i) => !existing.has(i.videoId));

      let inserted = 0;
      if (fresh.length > 0) {
        const details = await fetchVideoDetails(
          fresh.map((i) => i.videoId),
          apiKey,
        );
        unitsUsed += Math.ceil(fresh.length / VIDEOS_BATCH) * VIDEOS_UNITS;

        const queryTags = detectTags(row.query);
        const rows = fresh
          .map((item) => {
            const detail = details.get(item.videoId);
            if (detail?.categoryId != null && EXCLUDED_CATEGORY_IDS.has(detail.categoryId)) return null;

            // タイトル/説明文から付与。1つも付かなければ検索語由来のタグで補う
            let tags = detectTags(item.title, item.description);
            if (tags.length === 0) {
              const text = `${item.title}\n${item.description.slice(0, 150)}`;
              if (!GENERIC_FOOD_WORDS.some((w) => text.includes(w))) return null; // 料理と無関係
              tags = queryTags;
            }

            return {
              video_id: item.videoId,
              title: item.title,
              channel_title: item.channelTitle,
              thumbnail_url: item.thumbnailUrl,
              description: item.description.slice(0, DESCRIPTION_MAX_LENGTH),
              published_at: item.publishedAt || null,
              view_count: detail?.viewCount ?? 0,
              duration_seconds: detail?.durationSeconds ?? null,
              category_id: detail?.categoryId ?? null,
              tags,
              fetched_at: new Date().toISOString(),
            };
          })
          .filter((r): r is NonNullable<typeof r> => r !== null);

        if (rows.length > 0) {
          const { error } = await supabase.from("videos").upsert(rows, { onConflict: "video_id" });
          if (error) throw new Error(error.message);
          inserted = rows.length;
        }
      }
      added += inserted;
      pagesProcessed++;

      const exhausted = !nextPageToken || fresh.length < MIN_NEW_PER_PAGE;
      const { error: progressError } = await supabase
        .from("fetch_queue")
        .update({
          next_page_token: exhausted ? null : nextPageToken,
          pages_fetched: row.pages_fetched + 1,
          videos_added: row.videos_added + inserted,
          done: exhausted,
          last_fetched_at: new Date().toISOString(),
        })
        .eq("id", row.id);
      if (progressError) throw new Error(progressError.message);
    } catch (error) {
      if (error instanceof YouTubeError && error.isQuotaExceeded) {
        quotaExhausted = true;
        stopReason = "quotaExceeded";
      } else {
        stopReason = error instanceof Error ? error.message : "不明なエラー";
      }
      break;
    }
  }

  const { count: totalVideos } = await supabase
    .from("videos")
    .select("video_id", { count: "exact", head: true });

  return NextResponse.json({
    pagesProcessed,
    videosAdded: added,
    totalVideos,
    unitsUsed,
    stopReason,
    // true の間は、同じ日にこれ以上呼んでも進まない（翌日のクォータリセット待ち）
    quotaExhausted,
  });
}
