import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t bg-card">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p className="font-display font-bold text-foreground">モグビュー</p>
        <p>動画はYouTubeの埋め込みプレイヤーで再生されます。</p>
        <p>
          <Link href="/" className="hover:underline">
            &copy; {new Date().getFullYear()} モグビュー
          </Link>
        </p>
      </div>
    </footer>
  );
}
