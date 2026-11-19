"use client";

import Link from "next/link";
import { useMade, useShopping } from "@/lib/localStore";

function Badge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="ml-1 inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-brand-600 px-1.5 text-xs font-bold leading-5 text-white">
      {count}
    </span>
  );
}

export default function NavLinks() {
  const shoppingCount = useShopping().videos.length;
  const madeCount = Object.keys(useMade()).length;
  const link = "whitespace-nowrap hover:text-brand-600";
  // スマホではロゴの下の2段目に置き、収まらなければ横スクロール。sm以上はロゴの右に並べる
  return (
    <nav className="no-scrollbar -mx-4 flex w-[calc(100%+2rem)] items-center gap-3 overflow-x-auto px-4 text-sm font-medium text-stone-600 sm:mx-0 sm:w-auto sm:gap-4 sm:overflow-visible sm:px-0">
      <Link href="/search" className={link}>
        さがす
      </Link>
      <Link href="/season" className={link}>
        季節<span className="hidden sm:inline">特集</span>
      </Link>
      <Link href="/gacha" className={link}>
        <span className="hidden sm:inline">献立</span>ガチャ
      </Link>
      <Link href="/shopping" className={link}>
        🛒 買い物
        <Badge count={shoppingCount} />
      </Link>
      <Link href="/made" className={link}>
        ✔ 作ったよ
        <Badge count={madeCount} />
      </Link>
    </nav>
  );
}
