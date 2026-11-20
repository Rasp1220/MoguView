"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
      <div className="relative min-w-0 flex-1">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="料理名・タグで検索"
          maxLength={100}
          aria-label="キーワード"
          className="h-12 pl-12 text-base"
        />
      </div>
      <Button type="submit" size="lg" className="flex-shrink-0">
        検索
      </Button>
    </form>
  );
}
