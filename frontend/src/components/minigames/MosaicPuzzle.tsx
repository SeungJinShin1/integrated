'use client';

import { useState, useEffect, useRef } from 'react';
import ParticleCanvas from './ParticleCanvas';

const PIECES = [
  { id: 1, color: '#60a5fa', label: '연한 파란색', correct: false },
  { id: 2, color: '#3b82f6', label: '파란색', correct: true },
  { id: 3, color: '#93c5fd', label: '연한 하늘색', correct: false },
  { id: 4, color: '#2563eb', label: '진한 파란색', correct: false },
];

export default function MosaicPuzzle({ onComplete }: { onComplete: () => void }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [targetPulse, setTargetPulse] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Animate the target zone
  useEffect(() => {
    const interval = setInterval(() => setTargetPulse(p => !p), 1200);
    return () => clearInterval(interval);
  }, []);

  const handleSelect = (piece: typeof PIECES[0]) => {
    setSelected(piece.id);
    if (piece.correct) {
      setResult('correct');
      setTimeout(onComplete, 1000);
    } else {
      setResult('wrong');
      setTimeout(() => { setSelected(null); setResult(null); }, 800);
    }
  };

  return (
    <div className="minigame-card" style={{ position: 'relative', overflow: 'hidden' }}>
      <ParticleCanvas
        width={500}
        height={380}
        effect={result === 'correct' ? 'firework' : 'ambient'}
        active={true}
        intensity={result === 'correct' ? 2 : 0.3}
        color="#3b82f6"
      />

      <div style={{ position: 'relative', zIndex: 5 }}>
        <p className="minigame-title">올바른 파란색 조각을 찾으세요!</p>

        {/* Target area with gradient */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(96,165,250,0.15), rgba(59,130,246,0.1))',
          borderRadius: 16,
          padding: 20,
          marginBottom: 20,
          border: '1px solid rgba(59,130,246,0.2)',
        }}>
          <div style={{
            width: 56,
            height: 56,
            border: '3px dashed #60a5fa',
            borderRadius: 12,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.6s',
            boxShadow: targetPulse ? '0 0 24px rgba(59,130,246,0.4)' : '0 0 8px rgba(59,130,246,0.1)',
            background: result === 'correct' ? '#3b82f6' : 'transparent',
          }}>
            <span style={{ fontSize: 24, color: result === 'correct' ? 'white' : '#60a5fa' }}>
              {result === 'correct' ? '✓' : '?'}
            </span>
          </div>
          <p style={{ fontSize: 16, fontWeight: 800, color: '#93c5fd', marginTop: 10 }}>빈 칸의 색: 파란색</p>
          <p style={{ fontSize: 14, color: '#fcd34d', marginTop: 6 }}>힌트: '파란색'은 연한색과 진한색의 중간 정도로 가장 선명한 파란색이에요.</p>
        </div>

        {/* Color pieces grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          {PIECES.map((p, idx) => (
            <button
              key={p.id}
              onClick={() => handleSelect(p)}
              onMouseEnter={() => setHoveredId(p.id)}
              onMouseLeave={() => setHoveredId(null)}
              disabled={selected !== null}
              className="animate-card-flip"
              style={{
                width: '100%',
                aspectRatio: '1',
                borderRadius: 14,
                background: `linear-gradient(135deg, ${p.color}, ${p.color}dd)`,
                border: selected === p.id
                  ? (result === 'correct' ? '3px solid #22c55e' : '3px solid #ef4444')
                  : hoveredId === p.id ? '3px solid rgba(255,255,255,0.4)' : '3px solid transparent',
                cursor: selected !== null ? 'default' : 'pointer',
                transition: 'all 0.3s',
                animationDelay: `${idx * 0.08}s`,
                transform: selected === p.id && result === 'correct'
                  ? 'scale(1.15)'
                  : hoveredId === p.id ? 'scale(1.08)' : 'scale(1)',
                boxShadow: selected === p.id && result === 'correct'
                  ? '0 0 30px rgba(34,197,94,0.5)'
                  : hoveredId === p.id
                    ? `0 8px 24px ${p.color}40`
                    : `0 4px 12px ${p.color}20`,
                position: 'relative',
              }}
            >
              {/* Color label permanently visible to avoid confusion with hex codes */}
              <div style={{
                position: 'absolute',
                bottom: 8,
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(0,0,0,0.7)',
                color: 'white',
                padding: '4px 8px',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 800,
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
              }}>
                {p.label}
              </div>
            </button>
          ))}
        </div>

        {result === 'correct' && (
          <p className="minigame-success animate-success-scale">완벽한 조각을 찾았어요!</p>
        )}
        {result === 'wrong' && (
          <p className="minigame-fail">조금 다른 색이에요, 다시 시도!</p>
        )}
      </div>
    </div>
  );
}
