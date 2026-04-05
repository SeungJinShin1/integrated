'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useGame } from '@/contexts/GameContext';
import TopNavBar from '@/components/layout/TopNavBar';
import { LOW_BG_IMAGES } from '@/data/assetMap';
import { FaHeart, FaDownload, FaRotateLeft } from 'react-icons/fa6';
import { useTTS } from '@/hooks/useTTS';

const STICKERS = [
  { id: 'happy', emoji: '😊', label: '기뻐요' },
  { id: 'proud', emoji: '😎', label: '자랑스러워요' },
  { id: 'calm', emoji: '😌', label: '편안해요' },
  { id: 'surprised', emoji: '😲', label: '놀라워요' },
];

export default function LowEndingPage() {
  const { state, resetGame } = useGame();
  const router = useRouter();
  const [selectedSticker, setSelectedSticker] = useState<typeof STICKERS[0] | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // TTS messages
  const ttsText = selectedSticker
    ? '정말 멋진 감정이네요. 새싹 요원 수료증을 받으세요! 다운로드 버튼을 눌러 이미지를 저장할 수 있어요.'
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
    ctx.fillText('새싹 요원 수료증', canvas.width / 2, 180);

    // Subtitle
    ctx.fillStyle = '#15803d';
    ctx.font = 'bold 40px "Nanum Gothic", sans-serif';
    ctx.fillText('위 어린이는 훌륭하게 배려와 기다림을 실천했습니다.', canvas.width / 2, 280);

    // Name
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 60px "Nanum Gothic", sans-serif';
    const playerName = state.player.name === '나' ? '새싹 요원' : `${state.player.name} 요원`;
    ctx.fillText(playerName, canvas.width / 2, 380);

    // Hearts
    ctx.fillStyle = '#ec4899';
    ctx.font = '60px Arial';
    const heartCount = Math.max(1, state.hearts);
    let heartsStr = '';
    for (let i = 0; i < heartCount; i++) heartsStr += '💖 ';
    ctx.fillText(heartsStr, canvas.width / 2, 500);

    ctx.fillStyle = '#475569';
    ctx.font = '30px "Nanum Gothic", sans-serif';
    ctx.fillText(`획득한 하트: ${heartCount}개`, canvas.width / 2, 560);

    // Sticker
    ctx.fillStyle = '#334155';
    ctx.font = '40px "Nanum Gothic", sans-serif';
    ctx.fillText('나의 감정:', canvas.width / 2 - 80, 680);
    ctx.font = '80px Arial';
    ctx.fillText(selectedSticker.emoji, canvas.width / 2 + 80, 700);

    // Footer
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 24px "Nanum Gothic", sans-serif';
    ctx.fillText('원팀 프로젝트: 히든 피스', 200, 740);

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `새싹요원_수료증_${playerName.replace(' ', '_')}.png`;
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
      <div className="game-area" style={{ position: 'relative', overflowY: 'auto', background: '#f0fdf4' }}>
        <img src={LOW_BG_IMAGES.ending} alt="배경" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.1 }} />

        <canvas ref={canvasRef} style={{ display: 'none' }} />

        <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: 900, margin: '40px auto', padding: '0 16px' }}>
          <div style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)', padding: '40px 32px', borderRadius: 32, border: '4px solid #86efac', boxShadow: '0 24px 48px rgba(0,0,0,0.1)', textAlign: 'center' }}>

            {!selectedSticker ? (
              <div className="animate-fade-in">
                <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
                <h2 style={{ fontSize: 32, fontWeight: 800, color: '#166534', marginBottom: 16 }}>모든 미션 완료!</h2>
                
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, background: '#fdf2f8', padding: '12px 24px', borderRadius: 30, border: '2px solid #fbcfe8', marginBottom: 32 }}>
                  <span style={{ fontWeight: 800, color: '#be185d', fontSize: 16 }}>모은 하트:</span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {[...Array(Math.max(1, state.hearts))].map((_, i) => <FaHeart key={i} style={{ color: '#ec4899', fontSize: 20 }} />)}
                  </div>
                </div>

                <p style={{ fontSize: 20, color: '#334155', marginBottom: 24, fontWeight: 700 }}>지금 당신의 기분은 어떤가요?</p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                  {STICKERS.map(sticker => (
                    <button key={sticker.id} onClick={() => setSelectedSticker(sticker)} style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 16px', background: '#f8fafc',
                      border: '2px solid #e2e8f0', borderRadius: 24, cursor: 'pointer', transition: 'all 0.2s',
                    }} className="hover:bg-green-50 hover:border-green-400 hover:scale-105">
                      <span style={{ fontSize: 48, marginBottom: 16 }}>{sticker.emoji}</span>
                      <span style={{ fontSize: 16, fontWeight: 800, color: '#475569' }}>{sticker.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="animate-fade-in-up">
                <h2 style={{ fontSize: 28, fontWeight: 800, color: '#166534', marginBottom: 24 }}>새싹 요원 수료증 발급 준비 완료!</h2>

                <div style={{ background: '#f0fdf4', padding: '32px 24px', borderRadius: 24, border: '2px solid #bbf7d0', position: 'relative', overflow: 'hidden', marginBottom: 32 }}>
                  <span style={{ position: 'absolute', top: -20, right: -20, fontSize: 80, opacity: 0.2, transform: 'rotate(15deg)' }}>{selectedSticker.emoji}</span>
                  <div style={{ position: 'relative', zIndex: 10 }}>
                    <h3 style={{ fontSize: 24, fontWeight: 800, color: '#14532d', marginBottom: 12 }}>
                      {state.player.name === '나' ? '나' : state.player.name} 요원
                    </h3>
                    <p style={{ fontSize: 18, color: '#15803d', marginBottom: 16, fontWeight: 700 }}>
                      훌륭하게 배려와 기다림을 실천했습니다.
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
                      {[...Array(Math.max(1, state.hearts))].map((_, i) => <span key={i} style={{ fontSize: 24 }}>💖</span>)}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
                  <button onClick={downloadCertificate} disabled={isDownloading} style={{
                    padding: '16px 32px', background: '#16a34a', color: 'white', borderRadius: 16, border: 'none',
                    fontSize: 18, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12,
                    boxShadow: '0 8px 16px rgba(22,163,74,0.3)', opacity: isDownloading ? 0.7 : 1, fontFamily: "'Nanum Gothic', sans-serif"
                  }}>
                    {isDownloading ? <span className="animate-pulse">이미지 생성 중...</span> : <><FaDownload /> 수료증 저장하기</>}
                  </button>
                  <button onClick={handleReset} style={{
                    padding: '16px 32px', background: '#f1f5f9', color: '#475569', borderRadius: 16, border: 'none',
                    fontSize: 18, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, fontFamily: "'Nanum Gothic', sans-serif"
                  }}>
                    <FaRotateLeft /> 처음으로
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
