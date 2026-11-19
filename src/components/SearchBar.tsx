"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SearchBar({
  initialQuery = "",
  tag = "",
  sort = "",
}: {
  initialQuery?: string;
  tag?: string;
  sort?: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const router = useRouter();

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (tag) params.set("tag", tag);
    if (sort) params.set("sort", sort);
    // URLSearchParams.size は iOS 16 以前の Safari に無いため toString() で判定する
    const qs = params.toString();
    router.push(qs ? `/search?${qs}` : "/search");
  }

  return (
    <form onSubmit={handleSubmit} role="search" className="flex w-full gap-2">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="料理名・タグで検索（例：麻婆豆腐 / 中華）"
        maxLength={100}
        aria-label="キーワード"
        className="w-full min-w-0 rounded-full border border-brand-200 bg-white px-5 py-3 text-base shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
      />
      <button
        type="submit"
        className="flex-shrink-0 whitespace-nowrap rounded-full bg-brand-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-brand-700"
      >
        検索
      </button>
    </form>
  );
}
