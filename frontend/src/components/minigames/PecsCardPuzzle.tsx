'use client';

import { useState } from 'react';

const PECS_CARDS = [
  { id: 1, emoji: '🖐️', label: '나', type: 'subject' },
  { id: 2, emoji: '🎨', label: '할 수 있어', type: 'verb' },
  { id: 3, emoji: '🧩', label: '퍼즐', type: 'object' },
];

export default function PecsCardPuzzle({ npcName, onComplete }: { npcName: string; onComplete: () => void }) {
  const [selected, setSelected] = useState<number[]>([]);
  const [completed, setCompleted] = useState(false);

  const handleSelect = (id: number) => {
    if (completed) return;
    const newSelected = selected.includes(id) ? selected.filter(s => s !== id) : [...selected, id];
    setSelected(newSelected);

    if (newSelected.length === 3) {
      setCompleted(true);
      setTimeout(onComplete, 1000);
    }
  };

  return (
    <div style={{ background: 'rgba(255,255,255,0.95)', borderRadius: 20, padding: 24, boxShadow: '0 16px 40px rgba(0,0,0,0.3)', textAlign: 'center' }}>
      <p style={{ fontSize: 14, fontWeight: 700, color: '#334155', marginBottom: 16 }}>
        💬 {npcName}(이)의 PECS 카드를 조합하세요
      </p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 16 }}>
        {PECS_CARDS.map(card => (
          <button key={card.id} onClick={() => handleSelect(card.id)} style={{
            padding: '16px 20px', borderRadius: 14,
            border: selected.includes(card.id) ? '3px solid #6366f1' : '2px solid #e2e8f0',
            background: selected.includes(card.id) ? '#eef2ff' : '#f8fafc',
            cursor: completed ? 'default' : 'pointer', transition: 'all 0.2s',
            fontFamily: "'Nanum Gothic', sans-serif",
          }}>
            <div style={{ fontSize: 32, marginBottom: 4 }}>{card.emoji}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>{card.label}</div>
          </button>
        ))}
      </div>
      {selected.length > 0 && (
        <div style={{ background: '#f8fafc', borderRadius: 12, padding: 12, marginBottom: 8 }}>
          <p style={{ fontSize: 15, color: '#334155' }}>
            {selected.map(id => PECS_CARDS.find(c => c.id === id)?.label).join(' ')}
          </p>
        </div>
      )}
      {completed && <p style={{ color: '#16a34a', fontWeight: 700 }}>✅ &quot;나 할 수 있어 퍼즐&quot; - 메시지 완성!</p>}
    </div>
  );
}
