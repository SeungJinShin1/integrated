'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useGame } from '@/contexts/GameContext';
import TopNavBar from '@/components/layout/TopNavBar';
import { LOW_BG_IMAGES } from '@/data/assetMap';
import Icon from '@/components/ui/Icon';
import { useTTS } from '@/hooks/useTTS';

// 각 스티커는 라벨(한글) + 배경 색상으로만 구분. 이모지는 저작권 이슈로 사용하지 않습니다.
const STICKERS = [
  { id: 'happy', label: '기뻐요', color: '#fde68a', border: '#f59e0b' },
  { id: 'proud', label: '자랑스러워요', color: '#c7d2fe', border: '#6366f1' },
  { id: 'calm', label: '편안해요', color: '#bbf7d0', border: '#22c55e' },
  { id: 'surprised', label: '놀라워요', color: '#fbcfe8', border: '#ec4899' },
];

export default function LowEndingPage() {
  const { state, resetGame } = useGame();
  const router = useRouter();
  const [selectedSticker, setSelectedSticker] = useState<typeof STICKERS[0] | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // TTS messages
  const ttsText = selectedSticker
    ? '정말 멋진 감정이네요. 히든피스 새싹 수료증을 받으세요! 다운로드 버튼을 눌러 이미지를 저장할 수 있어요.'
    : '우와! 4개의 미션을 모두 완료했어요! 지금 기분이 어떤가요? 아래에서 감정 스티커를 하나 골라주세요.';
  useTTS(ttsText);

  const downloadCertificate = () => {
    if (!selectedSticker) return;
    setIsDownloading(true);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 1200;
    canvas.height = 800;

    // Background
    ctx.fillStyle = '#f0fdf4';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Border
    ctx.strokeStyle = '#86efac';
    ctx.lineWidth = 20;
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

    // Title
    ctx.fillStyle = '#166534';
    ctx.font = 'bold 80px "Nanum Gothic", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('히든피스 새싹 수료증', canvas.width / 2, 180);

    // Subtitle
    ctx.fillStyle = '#15803d';
    ctx.font = 'bold 40px "Nanum Gothic", sans-serif';
    ctx.fillText('위 어린이는 훌륭하게 배려와 기다림을 실천했습니다.', canvas.width / 2, 280);

    // Name
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 60px "Nanum Gothic", sans-serif';
    const playerName = state.player.name === '나' ? '히든피스 새싹' : `${state.player.name} 새싹`;
    ctx.fillText(playerName, canvas.width / 2, 380);

    // Hearts — 텍스트만 (이모지 없이)
    const heartCount = Math.max(1, state.hearts);
    ctx.fillStyle = '#ec4899';
    ctx.font = 'bold 50px "Nanum Gothic", sans-serif';
    ctx.fillText(`획득한 하트 ${heartCount}개`, canvas.width / 2, 520);

    // Sticker — 라벨만
    ctx.fillStyle = '#334155';
    ctx.font = 'bold 42px "Nanum Gothic", sans-serif';
    ctx.fillText(`나의 감정: ${selectedSticker.label}`, canvas.width / 2, 680);

    // Footer
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 24px "Nanum Gothic", sans-serif';
    ctx.fillText('히든피스: 우리 반 보물찾기', 200, 740);

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `히든피스_새싹_수료증_${playerName.replace(' ', '_')}.png`;
    link.href = dataUrl;
    link.click();

    setTimeout(() => setIsDownloading(false), 1000);
  };

  const handleReset = () => {
    resetGame();
    router.push('/start');
  };

  return (
    <>
      <TopNavBar />
      <div className="game-area" style={{ background: '#f0fdf4' }}>
        <img src={LOW_BG_IMAGES.ending} alt="배경" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.1, pointerEvents: 'none' }} />

        <canvas ref={canvasRef} style={{ display: 'none' }} />

        <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: 900, margin: '40px auto', padding: '0 16px' }}>
          <div style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)', padding: '40px 32px', borderRadius: 32, border: '4px solid #86efac', boxShadow: '0 24px 48px rgba(0,0,0,0.1)', textAlign: 'center' }}>

            {!selectedSticker ? (
              <div className="animate-fade-in">
                <h2 style={{ fontSize: 32, fontWeight: 800, color: '#166534', marginBottom: 16 }}>모든 미션 완료!</h2>
                
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, background: '#fdf2f8', padding: '12px 24px', borderRadius: 30, border: '2px solid #fbcfe8', marginBottom: 32 }}>
                  <span style={{ fontWeight: 800, color: '#be185d', fontSize: 16 }}>모은 하트:</span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {[...Array(Math.max(1, state.hearts))].map((_, i) => <Icon key={i} name="heart" size={22} alt="하트" />)}
                  </div>
                </div>

                <p style={{ fontSize: 20, color: '#334155', marginBottom: 24, fontWeight: 700 }}>지금 당신의 기분은 어떤가요?</p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                  {STICKERS.map(sticker => (
                    <button key={sticker.id} onClick={() => setSelectedSticker(sticker)} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 110, padding: '24px 16px',
                      background: sticker.color,
                      border: `3px solid ${sticker.border}`, borderRadius: 24, cursor: 'pointer', transition: 'all 0.2s',
                    }} className="hover:scale-105">
                      <span style={{ fontSize: 22, fontWeight: 800, color: '#1e293b' }}>{sticker.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="animate-fade-in-up">
                <h2 style={{ fontSize: 28, fontWeight: 800, color: '#166534', marginBottom: 24 }}>히든피스 새싹 수료증 발급 준비 완료!</h2>

                <div style={{ background: '#f0fdf4', padding: '32px 24px', borderRadius: 24, border: '2px solid #bbf7d0', position: 'relative', overflow: 'hidden', marginBottom: 32 }}>
                  <div style={{ position: 'relative', zIndex: 10 }}>
                    <h3 style={{ fontSize: 24, fontWeight: 800, color: '#14532d', marginBottom: 12 }}>
                      {state.player.name === '나' ? '나' : state.player.name} 새싹
                    </h3>
                    <p style={{ fontSize: 18, color: '#15803d', marginBottom: 16, fontWeight: 700 }}>
                      훌륭하게 배려와 기다림을 실천했습니다.
                    </p>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: 'rgba(255,255,255,0.6)', borderRadius: 999, border: '1px solid #bbf7d0' }}>
                      <span style={{ fontSize: 14, color: '#166534', fontWeight: 800 }}>나의 감정:</span>
                      <span style={{
                        fontSize: 14, fontWeight: 800, color: '#1e293b',
                        padding: '4px 12px', borderRadius: 999,
                        background: selectedSticker.color, border: `2px solid ${selectedSticker.border}`,
                      }}>{selectedSticker.label}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
                  <button onClick={downloadCertificate} disabled={isDownloading} style={{
                    padding: '16px 32px', background: '#16a34a', color: 'white', borderRadius: 16, border: 'none',
                    fontSize: 18, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12,
                    boxShadow: '0 8px 16px rgba(22,163,74,0.3)', opacity: isDownloading ? 0.7 : 1, fontFamily: "'Nanum Gothic', sans-serif"
                  }}>
                    {isDownloading ? <span className="animate-pulse">이미지 생성 중...</span> : <><Icon name="download" alt="다운로드" /> 수료증 저장하기</>}
                  </button>
                  <button onClick={handleReset} style={{
                    padding: '16px 32px', background: '#f1f5f9', color: '#475569', borderRadius: 16, border: 'none',
                    fontSize: 18, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, fontFamily: "'Nanum Gothic', sans-serif"
                  }}>
                    <Icon name="back" alt="처음으로" /> 처음으로
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
}
