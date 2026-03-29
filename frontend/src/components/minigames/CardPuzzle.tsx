'use client';

import { useState } from 'react';

interface CardPuzzleProps {
  npcName: string;
  onComplete: () => void;
}

const CARDS = [
  { id: 1, emoji: '🖍️', label: '크레파스', correct: true },
  { id: 2, emoji: '📚', label: '책', correct: false },
  { id: 3, emoji: '🍎', label: '사과', correct: false },
  { id: 4, emoji: '✂️', label: '가위', correct: false },
];

export default function CardPuzzle({ npcName, onComplete }: CardPuzzleProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null);

  const handleSelect = (card: typeof CARDS[0]) => {
    setSelected(card.id);
    if (card.correct) {
      setResult('correct');
      setTimeout(onComplete, 1200);
    } else {
      setResult('wrong');
      setTimeout(() => { setSelected(null); setResult(null); }, 800);
    }
  };

  return (
    <div style={{
      background: 'rgba(255,255,255,0.95)', borderRadius: 20, padding: 24,
      boxShadow: '0 16px 40px rgba(0,0,0,0.3)', textAlign: 'center',
    }}>
      <p style={{ fontSize: 14, fontWeight: 700, color: '#334155', marginBottom: 16 }}>
        🎮 {npcName}(이)가 찾고 있는 것은?
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
        {CARDS.map(card => (
          <button key={card.id} onClick={() => handleSelect(card)}
            disabled={selected !== null}
            style={{
              padding: 16, borderRadius: 14,
              border: selected === card.id
                ? result === 'correct' ? '3px solid #22c55e' : '3px solid #ef4444'
                : '2px solid #e2e8f0',
              background: selected === card.id
                ? result === 'correct' ? '#f0fdf4' : '#fef2f2'
                : '#f8fafc',
              cursor: selected !== null ? 'default' : 'pointer',
              transition: 'all 0.2s',
              fontFamily: "'Nanum Gothic', sans-serif",
            }}>
            <div style={{ fontSize: 36, marginBottom: 4 }}>{card.emoji}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#475569' }}>{card.label}</div>
          </button>
        ))}
      </div>
      {result === 'correct' && (
        <p style={{ marginTop: 12, color: '#16a34a', fontWeight: 700 }}>✅ 정답! 노란색 크레파스를 찾았어요!</p>
      )}
      {result === 'wrong' && (
        <p style={{ marginTop: 12, color: '#ef4444', fontWeight: 700 }}>❌ 다시 생각해 보세요!</p>
      )}
    </div>
  );
}
