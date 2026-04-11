import type { Metadata, Viewport } from "next";
import "./globals.css";
import { GameProvider } from "@/contexts/GameContext";
import { AuthProvider } from "@/contexts/AuthContext";
import PortraitNotice from "@/components/layout/PortraitNotice";

export const metadata: Metadata = {
  title: "히든피스: 우리 반 보물찾기 - 장애이해교육",
  description: "달라서 더 빛나는 우리들의 이야기. 서로의 숨겨진 조각(히든피스)을 모아 빛나는 우리 반을 완성하는 교육용 게임.",
  keywords: "장애이해교육, 특수교육, 자폐 스펙트럼, 초등학교, 보물찾기, 히든피스, 빛나는 우리 반",
};

// 태블릿(10~13인치) 학습자를 위한 뷰포트 설정.
// - width=device-width: 디바이스 폭에 맞춤
// - initialScale=1: 기본 확대 없이 시작
// - maximumScale=5: 접근성을 위해 핀치 확대 허용
// - viewportFit=cover: iPad 안전 영역 밖까지 채움
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  themeColor: "#0f172a",
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
            <PortraitNotice />
          </GameProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
