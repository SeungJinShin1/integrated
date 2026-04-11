import type { Metadata } from "next";
import "./globals.css";
import { GameProvider } from "@/contexts/GameContext";
import { AuthProvider } from "@/contexts/AuthContext";

export const metadata: Metadata = {
  title: "히든피스: 우리 반 보물찾기 💎 - 장애이해교육",
  description: "달라서 더 빛나는 우리들의 이야기. 서로의 숨겨진 조각(히든피스)을 모아 빛나는 우리 반을 완성하는 교육용 게임.",
  keywords: "장애이해교육, 특수교육, 자폐 스펙트럼, 초등학교, 보물찾기, 히든피스, 빛나는 우리 반",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Nanum+Gothic:wght@400;700;800&display=swap" rel="stylesheet" />
      </head>
      <body style={{ fontFamily: "'Nanum Gothic', sans-serif" }}>
        <AuthProvider>
          <GameProvider>
            {children}
          </GameProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
