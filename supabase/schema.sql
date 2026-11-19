-- モグビュー DBスキーマ（Supabase SQL Editor で実行。何度実行しても安全）

create extension if not exists pg_trgm;

-- ───────── 動画プール ─────────
create table if not exists public.videos (
  video_id text primary key,
  title text not null,
  channel_title text not null default '',
  thumbnail_url text not null,
  description text not null default '',
  published_at timestamptz,
  view_count bigint not null default 0,
  duration_seconds integer,
  category_id integer,
  -- 和食・中華・ラーメン…などのタグ（取り込み時にタイトル/説明文から自動付与）
  tags text[] not null default '{}',
  fetched_at timestamptz not null default now()
);

-- 説明文から抜き出した材料・作り方（{"ingredients":[{"name","amount"}],"steps":[...]}）。
-- null = 未取得（取り込みバッチが少しずつ補完する）、中身が空 = 説明文から読み取れなかった
alter table public.videos add column if not exists recipe jsonb;
create index if not exists videos_recipe_pending_idx on public.videos (video_id) where recipe is null;

create index if not exists videos_title_trgm_idx on public.videos using gin (title gin_trgm_ops);
create index if not exists videos_channel_trgm_idx on public.videos using gin (channel_title gin_trgm_ops);
create index if not exists videos_tags_idx on public.videos using gin (tags);
create index if not exists videos_view_count_idx on public.videos (view_count desc);
create index if not exists videos_published_at_idx on public.videos (published_at desc);

-- ───────── 取り込みキュー（日をまたいで再開するための進捗） ─────────
-- 1行 = 「検索語 × 並び順」。next_page_token を保存して続きから取得する。
create table if not exists public.fetch_queue (
  id text primary key,                -- "<query>|<order>"
  query text not null,
  sort_order text not null,           -- relevance / date / viewCount
  next_page_token text,
  pages_fetched integer not null default 0,
  videos_added integer not null default 0,
  done boolean not null default false,
  last_fetched_at timestamptz
);
create index if not exists fetch_queue_pick_idx
  on public.fetch_queue (pages_fetched, last_fetched_at nulls first) where not done;

-- ───────── RLS：閲覧は誰でも、書き込みは service_role のみ ─────────
alter table public.videos enable row level security;
alter table public.fetch_queue enable row level security;

drop policy if exists "Anyone can read videos" on public.videos;
create policy "Anyone can read videos" on public.videos for select using (true);
-- fetch_queue にはポリシーを作らない（service_role だけが読み書きできる）

-- ───────── 検索 ─────────
-- LIKEのメタ文字をエスケープ
create or replace function public.escape_like(t text)
returns text language sql immutable as $$
  select replace(replace(replace(t, '\', '\\'), '%', '\%'), '_', '\_');
$$;

-- 絞り込み条件：
--  * search_tag … tags にそのタグを持つ（完全一致）
--  * search_query … 空白区切りの各語について、タイトル/チャンネル名の部分一致
--    またはタグ完全一致（"中華"などのタグ検索）のいずれかを満たす（AND）
create or replace function public.videos_match(v public.videos, search_query text, search_tag text)
returns boolean
language sql
stable
as $$
  select
    (coalesce(search_tag, '') = '' or v.tags @> array[search_tag])
    and not exists (
      select 1
      from unnest(regexp_split_to_array(trim(coalesce(search_query, '')), '[[:space:]　]+')) as t(term)
      where term <> ''
        and not (
          v.title ilike '%' || public.escape_like(term) || '%'
          or v.channel_title ilike '%' || public.escape_like(term) || '%'
          or v.tags @> array[term]
        )
    );
$$;

-- sort_by: 'view_count'（人気順）/ 'published_at'（新着順）
create or replace function public.search_videos(
  search_query text default null,
  search_tag text default null,
  sort_by text default 'view_count',
  result_limit integer default 48,
  result_offset integer default 0
)
returns setof public.videos
language sql
stable
as $$
  select v.*
  from public.videos v
  where public.videos_match(v, search_query, search_tag)
  order by
    case when sort_by = 'view_count' then v.view_count end desc nulls last,
    v.published_at desc nulls last,
    v.video_id
  limit least(result_limit, 100)
  offset result_offset;
$$;

create or replace function public.count_videos(
  search_query text default null,
  search_tag text default null
)
returns integer
language sql
stable
as $$
  select count(*)::integer from public.videos v where public.videos_match(v, search_query, search_tag);
$$;

notify pgrst, 'reload schema';
