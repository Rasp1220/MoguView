import type { Metadata } from "next";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { VideoPlayerProvider } from "@/components/VideoPlayer";
import { Zen_Maru_Gothic, Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const display = Zen_Maru_Gothic({ weight: ["500", "700", "900"], subsets: ["latin"], variable: "--font-display", display: "swap" });
const body = Noto_Sans_JP({ subsets: ["latin"], variable: "--font-body", display: "swap" });

export const metadata: Metadata = {
  title: "モグビュー | 料理動画をまるごと探せる",
  description:
    "和食・中華・ラーメン・イタリアン・スイーツ…食べたい料理の動画をタイトルやタグで探せるサービス。モグ（食べる）ビュー（見る）。",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={`${display.variable} ${body.variable}`}>
      <body>
        <VideoPlayerProvider>
          <NavBar />
          <main className="mx-auto min-h-[calc(100vh-57px)] max-w-7xl px-4 py-8">{children}</main>
          <Footer />
        </VideoPlayerProvider>
      </body>
    </html>
  );
}
