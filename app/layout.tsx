import type { Metadata } from "next";
import "./globals.css";
import NavBar from "@/components/NavBar";

export const metadata: Metadata = {
  title: "PitLane · F1 25 车手社区",
  description: "PitLane —— F1 25 玩家社区平台：TT 圈速录入、AI 难度建议、双人生涯招募、大奖赛房间",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <NavBar />
        <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10">
          {children}
        </main>
        <footer className="border-t border-border py-6 text-center text-xs text-muted">
          PitLane · F1 25 车手社区 · 圈速纯信任制，无审核
        </footer>
      </body>
    </html>
  );
}
