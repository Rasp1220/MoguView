import { NextRequest, NextResponse } from "next/server";
import { drawVideo } from "@/lib/gacha";
import { GACHA_ROLE_IDS, type GachaRole } from "@/lib/gachaRoles";
import type { Video } from "@/lib/types";

export const dynamic = "force-dynamic";

/**
 * 今日の献立ガチャ。`/api/gacha?roles=main,side,soup&exclude=<videoId>,...`
 * 役割ごとに動画を1本ずつ引いて返す（引けなかった役割は null）。
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const roles = (params.get("roles") ?? GACHA_ROLE_IDS.join(","))
    .split(",")
    .filter((r): r is GachaRole => (GACHA_ROLE_IDS as string[]).includes(r));
  if (roles.length === 0) {
    return NextResponse.json({ error: "roles が正しくありません" }, { status: 400 });
  }
  const exclude = new Set(
    (params.get("exclude") ?? "")
      .split(",")
      .filter((id) => /^[\w-]{1,20}$/.test(id))
      .slice(0, 12),
  );

  const results: Partial<Record<GachaRole, Video | null>> = {};
  for (const role of roles) {
    const video = await drawVideo(role, exclude);
    results[role] = video;
    if (video) exclude.add(video.videoId); // 同じ動画を別の役割で引かない
  }
  return NextResponse.json({ results });
}
