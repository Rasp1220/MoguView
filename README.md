# モグビュー

モグ（食べる）× ビュー（見る）。料理動画を YouTube から取り込み、タイトル・タグで探せるサービスです。
[yurukake](https://github.com/Rasp1220/yurukake) の「バッチで動画プールを貯め、サイトは DB だけを読む」方式をベースにしています。

## 機能

- **トップページ**：検索バー＋5カテゴリ（和食／中華／ラーメン／イタリアン／スイーツ）の横スクロールスライダー（再生数順10件、「もっと見る」で検索へ）。カテゴリは `src/lib/tags.ts` の `SLIDER_CATEGORIES` で変更できます
- **検索**（`/search`）：空白区切りの各語を「タイトル／チャンネル名の部分一致」または「タグ完全一致（例：中華）」で AND 検索。タグチップでの絞り込み、人気順／新着順、ページ送り（48件/ページ）
- **動画再生**：カードを押すと YouTube 埋め込みプレイヤーをモーダルで再生
- **取り込みバッチ**：YouTube API のクォータ上限まで取り込み、翌日以降に続きから再開（下記）

## セットアップ

```bash
npm install
cp .env.example .env.local   # 値を設定
npm run dev
```

1. Supabase プロジェクトを作成し、`supabase/schema.sql` を SQL Editor で実行（冪等）
2. `.env.local` に `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` / `YOUTUBE_API_KEY` / `CRON_SECRET` を設定
3. Supabase 未設定のままローカル（`NODE_ENV !== "production"`）で起動すると、サンプルデータで画面を確認できます

書き込みは `service_role` のみ（RLS で anon は読み取り専用）です。

## 動画の取り込み（5万件を想定）

`/api/cron/fetch-videos`（`Authorization: Bearer $CRON_SECRET`）が `videos` テーブルを埋めます。サイト側は YouTube API を一切呼びません。

1. 「料理キーワード（約70）× 切り口3種（レシピ／作り方／食べ歩き）× 並び順3種（関連度／新着／再生数）」＝約600本の検索を `fetch_queue` に登録（`src/lib/fetchPlan.ts`）
2. 進捗の浅いキューから順に `search.list` を1ページ（50件）ずつ進め、`nextPageToken` を保存。全キューを均等に掘り進めるので、カテゴリが偏りません
3. 取得済みの動画は `videos.list` を呼ばずスキップ（クォータ節約）。新規のみ再生数・カテゴリ・長さを取得し、音楽/ゲーム等のカテゴリ、料理と無関係な動画は除外
4. タイトル・説明文から **タグを自動付与**（`src/lib/tags.ts` の `TAG_DEFINITIONS`）
5. 新規がほぼ出なくなった／次ページが無いキューは完了扱い。`quotaExceeded` を検知したら即停止し、翌日続きから再開
6. `MAX_VIDEOS`（既定 50000）に達したら何もしない

`.github/workflows/fetch-videos.yml` が毎日（YouTube のクォータ・リセット直後）、1回 約2,400ユニット × 最大4回まで呼びます。GitHub の Secrets に `APP_BASE_URL` と `CRON_SECRET` を設定してください。手動実行は Actions の "Run workflow" から。

**目安**：`search.list` は 100 ユニット/50件、1日クォータ 10,000 → 最大約 5,000件/日。重複・除外を考慮すると 5万件到達まで 数週間〜1か月ほどです（クォータ引き上げ申請で短縮可能）。
