export default function Footer() {
  return (
    <footer className="border-t border-brand-100 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-6 text-center text-sm text-stone-400">
        &copy; {new Date().getFullYear()} モグビュー — 動画はYouTubeの埋め込みプレイヤーで再生されます
      </div>
    </footer>
  );
}
