import Link from "next/link";

export default function Pagination({
  page,
  totalPages,
  hrefFor,
}: {
  page: number;
  totalPages: number;
  hrefFor: (page: number) => string;
}) {
  if (totalPages <= 1) return null;

  const pages: (number | "…")[] = [];
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || Math.abs(p - page) <= 2) pages.push(p);
    else if (pages[pages.length - 1] !== "…") pages.push("…");
  }

  const base = "min-w-9 rounded-md border px-3 py-1.5 text-center text-sm font-medium transition-colors";
  return (
    <nav aria-label="ページ送り" className="mt-8 flex flex-wrap items-center justify-center gap-1.5">
      {page > 1 && (
        <Link href={hrefFor(page - 1)} className={`${base} bg-card text-muted-foreground hover:bg-accent`}>
          前へ
        </Link>
      )}
      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`gap-${i}`} className="px-1 text-muted-foreground">
            …
          </span>
        ) : (
          <Link
            key={p}
            href={hrefFor(p)}
            aria-current={p === page ? "page" : undefined}
            className={`${base} ${
              p === page
                ? "border-primary bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground hover:bg-accent"
            }`}
          >
            {p}
          </Link>
        ),
      )}
      {page < totalPages && (
        <Link href={hrefFor(page + 1)} className={`${base} bg-card text-muted-foreground hover:bg-accent`}>
          次へ
        </Link>
      )}
    </nav>
  );
}
