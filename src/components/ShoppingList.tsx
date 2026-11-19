"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { hasIngredients } from "@/lib/recipe";
import { mergeIngredients, shoppingListText } from "@/lib/shopping";
import {
  addExtra,
  clearChecked,
  clearShopping,
  removeExtra,
  removeFromShopping,
  toggleChecked,
  useShopping,
} from "@/lib/localStore";
import { useVideoPlayer } from "./VideoPlayer";

const actionBtn =
  "rounded-full border border-stone-300 px-4 py-1.5 text-sm font-medium text-stone-600 transition hover:border-stone-500";

export default function ShoppingList() {
  const shopping = useShopping();
  const { open } = useVideoPlayer();
  const [extra, setExtra] = useState("");
  const [notice, setNotice] = useState("");

  const items = useMemo(() => {
    const merged = mergeIngredients(shopping.videos).map((i) => ({
      id: i.key,
      name: i.name,
      amount: i.amount,
      count: i.count,
      checked: shopping.checked.includes(i.key),
      extra: false,
    }));
    const extras = shopping.extras.map((e) => ({
      id: `extra:${e.id}`,
      name: e.name,
      amount: "",
      count: 0,
      checked: shopping.checked.includes(`extra:${e.id}`),
      extra: true,
    }));
    return [...merged, ...extras];
  }, [shopping]);

  const remaining = items.filter((i) => !i.checked);
  const done = items.filter((i) => i.checked);
  const text = shoppingListText(items);
  const isEmpty = shopping.videos.length === 0 && shopping.extras.length === 0;

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setNotice("コピーしました");
    } catch {
      setNotice("コピーできませんでした");
    }
    setTimeout(() => setNotice(""), 2500);
  }

  async function share() {
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: "買い物リスト", text });
        return;
      } catch {
        return; // キャンセル
      }
    }
    await copy();
  }

  function submitExtra(e: React.FormEvent) {
    e.preventDefault();
    addExtra(extra);
    setExtra("");
  }

  const row = (i: (typeof items)[number]) => (
    <li key={i.id} className="flex items-center gap-3 px-4 py-2.5">
      <input
        id={`item-${i.id}`}
        type="checkbox"
        checked={i.checked}
        onChange={() => toggleChecked(i.id)}
        className="h-5 w-5 flex-shrink-0 accent-brand-600"
      />
      <label
        htmlFor={`item-${i.id}`}
        className={`flex flex-1 cursor-pointer flex-wrap items-baseline justify-between gap-x-3 ${
          i.checked ? "text-stone-400 line-through" : "text-stone-800"
        }`}
      >
        <span className="font-medium">{i.name}</span>
        <span className="text-sm text-stone-500">
          {i.amount}
          {i.count > 1 && (
            <span className="ml-2 rounded-full bg-brand-50 px-2 py-0.5 text-xs text-brand-700 no-underline">
              {i.count}品で使う
            </span>
          )}
        </span>
      </label>
      {i.extra && (
        <button
          type="button"
          aria-label={`${i.name}を削除`}
          onClick={() => removeExtra(i.id.replace("extra:", ""))}
          className="flex-shrink-0 text-stone-400 hover:text-red-500"
        >
          ✕
        </button>
      )}
    </li>
  );

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-800">🛒 買い物リスト</h1>
        <p className="mt-1 text-sm text-stone-500">
          動画の材料を同じ食材ごとにまとめます。このリストはお使いの端末のブラウザに保存されます（ログイン不要）。
        </p>
      </div>

      {isEmpty ? (
        <div className="rounded-2xl border border-dashed border-brand-200 bg-white px-6 py-12 text-center text-stone-500">
          <p className="mb-4">まだ何も入っていません。動画の画面で「🛒 買い物リストに入れる」を押してください。</p>
          <div className="flex flex-wrap justify-center gap-3 text-sm font-medium">
            <Link href="/search" className="rounded-full bg-brand-600 px-5 py-2 text-white hover:bg-brand-700">
              動画をさがす
            </Link>
            <Link href="/gacha" className="rounded-full border border-brand-300 px-5 py-2 text-brand-700 hover:bg-brand-50">
              献立ガチャを回す
            </Link>
          </div>
        </div>
      ) : (
        <>
          {shopping.videos.length > 0 && (
            <section aria-label="リストに入れた動画" className="space-y-2">
              <h2 className="text-sm font-bold text-stone-700">入れた動画（{shopping.videos.length}本）</h2>
              <ul className="grid gap-2 sm:grid-cols-2">
                {shopping.videos.map((v) => (
                  <li key={v.videoId} className="flex items-center gap-3 rounded-xl border border-brand-100 bg-white p-2">
                    <button type="button" onClick={() => open(v)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={v.thumbnailUrl} alt="" className="h-12 w-20 flex-shrink-0 rounded-lg object-cover" />
                      <span className="line-clamp-2 text-sm font-medium text-stone-700">{v.title}</span>
                    </button>
                    {!hasIngredients(v.recipe) && <span className="text-xs text-stone-400">材料なし</span>}
                    <button
                      type="button"
                      aria-label={`${v.title}をリストから外す`}
                      onClick={() => removeFromShopping(v.videoId)}
                      className="flex-shrink-0 px-1 text-stone-400 hover:text-red-500"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section aria-label="買うもの" className="space-y-3">
            <div className="flex items-end justify-between">
              <h2 className="text-sm font-bold text-stone-700">
                買うもの（残り {remaining.length} / {items.length}）
              </h2>
              {done.length > 0 && (
                <button type="button" onClick={clearChecked} className="text-xs text-stone-500 hover:underline">
                  チェックをすべて外す
                </button>
              )}
            </div>

            {items.length > 0 ? (
              <ul className="divide-y divide-brand-100 overflow-hidden rounded-2xl border border-brand-100 bg-white">
                {remaining.map(row)}
                {done.map(row)}
              </ul>
            ) : (
              <p className="text-sm text-stone-400">材料を読み取れた動画を入れると、ここにまとまります。</p>
            )}

            <form onSubmit={submitExtra} className="flex gap-2">
              <input
                value={extra}
                onChange={(e) => setExtra(e.target.value)}
                maxLength={40}
                placeholder="メモを追加（例：牛乳）"
                aria-label="買い物メモを追加"
                className="min-w-0 flex-1 rounded-full border border-brand-200 bg-white px-4 py-2 text-sm outline-none focus:border-brand-500"
              />
              <button type="submit" className="flex-shrink-0 rounded-full bg-stone-700 px-5 py-2 text-sm font-medium text-white hover:bg-stone-900">
                追加
              </button>
            </form>
          </section>

          <section aria-label="共有・整理" className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={copy} className={actionBtn}>
              📋 コピー
            </button>
            <a
              href={`https://line.me/R/msg/text/?${encodeURIComponent(text)}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`${actionBtn} border-emerald-400 text-emerald-700 hover:border-emerald-600`}
            >
              LINEで送る
            </a>
            <button type="button" onClick={share} className={actionBtn}>
              📤 共有
            </button>
            <button
              type="button"
              onClick={() => {
                if (window.confirm("買い物リストをすべて空にします。よろしいですか？")) clearShopping();
              }}
              className={`${actionBtn} ml-auto text-red-600 hover:border-red-400`}
            >
              すべて削除
            </button>
            <span role="status" className="w-full text-xs text-emerald-700">
              {notice}
            </span>
          </section>
        </>
      )}
    </div>
  );
}
