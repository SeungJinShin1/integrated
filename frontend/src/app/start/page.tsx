'use client';

import { useRouter } from 'next/navigation';
import { BG_IMAGES } from '@/data/assetMap';

export default function StartPage() {
  const router = useRouter();

  const handleClick = () => {
    router.push('/mode');
  };

  return (
    <div className="start-screen" onClick={handleClick} style={{ backgroundImage: `url(${BG_IMAGES.dataworld})` }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }} />

      <div style={{ position: 'relative', zIndex: 10 }}>
        <p style={{
          color: 'rgba(255,255,255,0.7)', fontSize: 18, fontWeight: 700,
          marginBottom: 16, textShadow: '0 2px 8px rgba(0,0,0,0.5)',
        }}>
          달라서 더 빛나는 우리들의 이야기
        </p>

        <h1 className="start-title">
          우리 반<br />보물찾기 💎
        </h1>

        <div className="start-prompt">
          게임을 시작하려면 마우스를 클릭하세요
        </div>
      </div>
    </div>
  );
}
