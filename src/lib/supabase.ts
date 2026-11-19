import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let readClient: SupabaseClient | null | undefined;
let adminClient: SupabaseClient | null | undefined;

const noStoreFetch: typeof fetch = (input, init) => fetch(input, { ...init, cache: "no-store" });

/** サイト表示用（anonキー・読み取りのみ）。未設定なら null。 */
export function getReadClient(): SupabaseClient | null {
  if (readClient !== undefined) return readClient;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  readClient =
    url && key
      ? createClient(url, key, {
          auth: { persistSession: false, autoRefreshToken: false },
          global: { fetch: noStoreFetch },
        })
      : null;
  return readClient;
}

/** 取り込みバッチ用（service_role・書き込み可）。未設定なら null。 */
export function getAdminClient(): SupabaseClient | null {
  if (adminClient !== undefined) return adminClient;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  adminClient =
    url && key
      ? createClient(url, key, {
          auth: { persistSession: false, autoRefreshToken: false },
          global: { fetch: noStoreFetch },
        })
      : null;
  return adminClient;
}
