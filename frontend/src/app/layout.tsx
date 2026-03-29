import type { Metadata } from "next";
import "./globals.css";
import { GameProvider } from "@/contexts/GameContext";
import { AuthProvider } from "@/contexts/AuthContext";

export const metadata: Metadata = {
  title: "우리 반 보물찾기 💎 - 장애이해교육",
  description: "달라서 더 빛나는 우리들의 이야기. 특별한 친구를 이해하고 함께 성장하는 교육용 게임.",
  keywords: "장애이해교육, 특수교육, 초등학교, 보물찾기, 히든피스",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <AuthProvider>
          <GameProvider>
            {children}
          </GameProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
