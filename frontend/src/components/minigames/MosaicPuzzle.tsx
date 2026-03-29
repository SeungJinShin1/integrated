'use client';

import { useState } from 'react';

const PIECES = [
  { id: 1, color: '#60a5fa', correct: false },
  { id: 2, color: '#3b82f6', correct: true },
  { id: 3, color: '#93c5fd', correct: false },
  { id: 4, color: '#2563eb', correct: false },
];

export default function MosaicPuzzle({ onComplete }: { onComplete: () => void }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<string | null>(null);

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
    <div style={{ background: 'rgba(255,255,255,0.95)', borderRadius: 20, padding: 24, boxShadow: '0 16px 40px rgba(0,0,0,0.3)', textAlign: 'center' }}>
      <p style={{ fontSize: 14, fontWeight: 700, color: '#334155', marginBottom: 16 }}>🧩 올바른 파란색 조각을 찾으세요!</p>
      <div style={{ background: 'linear-gradient(135deg, #bfdbfe, #93c5fd)', borderRadius: 12, padding: 16, marginBottom: 16 }}>
        <div style={{ width: 40, height: 40, border: '3px dashed #1e40af', borderRadius: 8, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 20 }}>?</span>
        </div>
        <p style={{ fontSize: 12, color: '#1e40af', marginTop: 8 }}>빈 칸의 색: #3b82f6</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
        {PIECES.map(p => (
          <button key={p.id} onClick={() => handleSelect(p)} disabled={selected !== null}
            style={{
              width: '100%', aspectRatio: '1', borderRadius: 10, background: p.color,
              border: selected === p.id ? (result === 'correct' ? '3px solid #22c55e' : '3px solid #ef4444') : '2px solid transparent',
              cursor: selected !== null ? 'default' : 'pointer', transition: 'all 0.2s',
            }} />
        ))}
      </div>
      {result === 'correct' && <p style={{ marginTop: 12, color: '#16a34a', fontWeight: 700 }}>✅ 완벽한 조각을 찾았어요!</p>}
      {result === 'wrong' && <p style={{ marginTop: 12, color: '#ef4444', fontWeight: 700 }}>❌ 조금 다른 색이에요, 다시 시도!</p>}
    </div>
  );
}
