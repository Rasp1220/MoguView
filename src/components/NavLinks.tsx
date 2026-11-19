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
  return (
    <nav className="flex flex-wrap items-center justify-end gap-x-4 gap-y-1 text-sm font-medium text-stone-600">
      <Link href="/search" className={link}>
        さがす
      </Link>
      <Link href="/season" className={link}>
        季節特集
      </Link>
      <Link href="/gacha" className={link}>
        献立ガチャ
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
