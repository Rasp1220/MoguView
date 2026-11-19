import Link from "next/link";

export default function Logo({ size = "md" }: { size?: "md" | "lg" }) {
  return (
    <Link
      href="/"
      className={`inline-flex flex-shrink-0 items-center gap-2 whitespace-nowrap font-extrabold tracking-tight text-brand-600 ${
        size === "lg" ? "text-4xl sm:text-5xl" : "text-xl"
      }`}
      aria-label="モグビュー トップへ"
    >
      <svg viewBox="0 0 64 64" className={size === "lg" ? "h-12 w-12" : "h-7 w-7"} aria-hidden>
        <rect width="64" height="64" rx="14" fill="currentColor" />
        <path d="M26 20v24l20-12z" fill="#fff" />
        <path d="M14 46c4 5 10 7 18 7s14-2 18-7" fill="none" stroke="#ffd8cd" strokeWidth="3" strokeLinecap="round" />
      </svg>
      モグビュー
    </Link>
  );
}
