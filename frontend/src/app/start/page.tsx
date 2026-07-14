'use client';

import { useRouter } from 'next/navigation';
import { BG_IMAGES } from '@/data/assetMap';
import ReportBadge from '@/components/layout/ReportBadge';
import CreditNotice from '@/components/layout/CreditNotice';

export default function StartPage() {
  const router = useRouter();

  const handleClick = () => {
    router.push('/mode');
  };

  return (
    <div className="start-screen" onClick={handleClick} style={{ backgroundImage: `url(${BG_IMAGES.dataworld})` }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)' }} />

      <div style={{ position: 'relative', zIndex: 10, textAlign: 'center' }}>
        <p style={{
          color: '#fde68a', fontSize: 22, fontWeight: 800,
          marginBottom: 24, textShadow: '0 2px 12px rgba(0,0,0,0.9)',
          letterSpacing: 1,
        }}>
          달라서 더 빛나는 우리들의 이야기
        </p>

        <h1 className="start-title">
          히든피스<br />우리 반 보물찾기
        </h1>

        <div className="start-prompt">
          학습을 시작하려면 클릭하세요
        </div>
      </div>

      {/* 연구대회 제출용 표기: 제목은 위 h1에 이미 있으므로 대상학년만 표시 */}
      <ReportBadge showTitle={false} />
      <CreditNotice />
    </div>
  );
}
