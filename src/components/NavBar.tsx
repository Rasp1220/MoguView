import Link from "next/link";
import Logo from "./Logo";

export default function NavBar() {
  return (
    <header className="sticky top-0 z-20 border-b border-brand-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Logo />
        <nav className="flex items-center gap-5 text-sm font-medium text-stone-600">
          <Link href="/search?sort=published_at" className="hover:text-brand-600">
            新着
          </Link>
          <Link href="/search" className="hover:text-brand-600">
            さがす
          </Link>
        </nav>
      </div>
    </header>
  );
}
