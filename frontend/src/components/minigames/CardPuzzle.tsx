'use client';

import { useState, useRef, useEffect } from 'react';
import ParticleCanvas from './ParticleCanvas';
import { AAC_CHOICE_IMAGES } from '@/data/assetMap';

interface CardPuzzleProps {
  npcName: string;
  onComplete: () => void;
}

const CARDS = [
  { id: 1, label: '크레파스', correct: true, img: AAC_CHOICE_IMAGES.crayon },
  { id: 2, label: '책', correct: false, img: AAC_CHOICE_IMAGES.book },
  { id: 3, label: '사과', correct: false, img: AAC_CHOICE_IMAGES.apple },
  { id: 4, label: '가위', correct: false, img: AAC_CHOICE_IMAGES.scissors },
];

export default function CardPuzzle({ npcName, onComplete }: CardPuzzleProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [showCards, setShowCards] = useState(false);
  const burstCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Stagger card entrance
    setTimeout(() => setShowCards(true), 200);
  }, []);

  const handleSelect = (card: typeof CARDS[0]) => {
    setSelected(card.id);
    if (card.correct) {
      setResult('correct');
      // Trigger particle burst on canvas
      if (burstCanvasRef.current) {
        const ctx = burstCanvasRef.current.getContext('2d');
        if (ctx) {
          const w = burstCanvasRef.current.width;
          const h = burstCanvasRef.current.height;
          // Spawn success particles
          for (let i = 0; i < 40; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 6;
            const colors = ['#22c55e', '#4ade80', '#fbbf24', '#f59e0b', '#a855f7', '#ec4899'];
            const color = colors[Math.floor(Math.random() * colors.length)];
            const size = 3 + Math.random() * 6;
            const x = w / 2 + Math.cos(angle) * speed * 10;
            const y = h / 2 + Math.sin(angle) * speed * 10;
            ctx.fillStyle = color;
            ctx.globalAlpha = 0.8;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
      setTimeout(onComplete, 1200);
    } else {
      setResult('wrong');
      setTimeout(() => { setSelected(null); setResult(null); }, 800);
    }
  };

  return (
    <div className="minigame-card" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Background particle effect */}
      <ParticleCanvas
        width={500}
        height={400}
        effect={result === 'correct' ? 'success' : 'ambient'}
        active={true}
        intensity={result === 'correct' ? 2 : 0.5}
        color={result === 'correct' ? '#22c55e' : undefined}
      />

      <canvas ref={burstCanvasRef} width={500} height={400} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2 }} />

      <div style={{ position: 'relative', zIndex: 5 }}>
        <p className="minigame-title">
          {npcName}(이)가 찾고 있는 것은?
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          {CARDS.map((card, idx) => (
            <button
              key={card.id}
              onClick={() => handleSelect(card)}
              onMouseEnter={() => setHoveredId(card.id)}
              onMouseLeave={() => setHoveredId(null)}
              disabled={selected !== null}
              className={showCards ? 'animate-card-flip' : ''}
              style={{
                padding: 20,
                borderRadius: 18,
                border: selected === card.id
                  ? result === 'correct' ? '3px solid #22c55e' : '3px solid #ef4444'
                  : hoveredId === card.id ? '2px solid rgba(99,102,241,0.6)' : '2px solid rgba(255,255,255,0.12)',
                background: selected === card.id
                  ? result === 'correct' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)'
                  : hoveredId === card.id ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.06)',
                cursor: selected !== null ? 'default' : 'pointer',
                transition: 'all 0.3s ease',
                fontFamily: "'Nanum Gothic', sans-serif",
                animationDelay: `${idx * 0.1}s`,
                transform: selected === card.id && result === 'correct' ? 'scale(1.08)' : hoveredId === card.id ? 'scale(1.05)' : 'scale(1)',
                boxShadow: selected === card.id && result === 'correct'
                  ? '0 0 30px rgba(34,197,94,0.4)'
                  : hoveredId === card.id ? '0 0 20px rgba(99,102,241,0.2)' : 'none',
              }}>
              <img src={card.img} alt={card.label} style={{ width: 56, height: 56, objectFit: 'contain', marginBottom: 6 }} draggable={false} />
              <div style={{ fontSize: 16, fontWeight: 800, color: '#e2e8f0' }}>{card.label}</div>
            </button>
          ))}
        </div>
        {result === 'correct' && (
          <p className="minigame-success animate-success-scale">정답! 노란색 크레파스를 찾았어요!</p>
        )}
        {result === 'wrong' && (
          <p className="minigame-fail">다시 생각해 보세요!</p>
        )}
      </div>
    </div>
  );
}
