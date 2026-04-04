'use client';

import { useState } from 'react';
import ParticleCanvas from './ParticleCanvas';

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
    <div className="minigame-card" style={{ position: 'relative', overflow: 'hidden' }}>
      <ParticleCanvas
        width={500}
        height={350}
        effect={completed ? 'firework' : 'ambient'}
        active={true}
        intensity={completed ? 2 : 0.3}
        color={completed ? '#6366f1' : '#c4b5fd'}
      />

      <div style={{ position: 'relative', zIndex: 5 }}>
        <p className="minigame-title">
          💬 {npcName}(이)의 PECS 카드를 조합하세요
        </p>

        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 20 }}>
          {PECS_CARDS.map((card, idx) => {
            const isSelected = selected.includes(card.id);
            const orderIndex = selected.indexOf(card.id);
            return (
              <button
                key={card.id}
                onClick={() => handleSelect(card.id)}
                className="animate-card-flip"
                style={{
                  padding: '20px 24px',
                  borderRadius: 18,
                  border: isSelected ? '3px solid #818cf8' : '2px solid rgba(255,255,255,0.12)',
                  background: isSelected
                    ? 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.15))'
                    : 'rgba(255,255,255,0.06)',
                  cursor: completed ? 'default' : 'pointer',
                  transition: 'all 0.3s ease',
                  fontFamily: "'Nanum Gothic', sans-serif",
                  animationDelay: `${idx * 0.1}s`,
                  transform: isSelected ? 'scale(1.05) translateY(-4px)' : 'scale(1)',
                  boxShadow: isSelected ? '0 8px 24px rgba(99,102,241,0.3)' : 'none',
                  position: 'relative',
                }}>
                {isSelected && (
                  <div style={{
                    position: 'absolute', top: -8, right: -8,
                    width: 24, height: 24, borderRadius: '50%',
                    background: '#6366f1', color: 'white',
                    fontSize: 12, fontWeight: 800,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(99,102,241,0.4)',
                  }}>
                    {orderIndex + 1}
                  </div>
                )}
                <div style={{
                  fontSize: 36, marginBottom: 8,
                  transition: 'transform 0.3s',
                  transform: isSelected ? 'scale(1.15)' : 'scale(1)',
                }}>
                  {card.emoji}
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>{card.label}</div>
              </button>
            );
          })}
        </div>

        {/* Combined sentence preview */}
        {selected.length > 0 && (
          <div style={{
            background: 'rgba(255,255,255,0.06)',
            borderRadius: 16,
            padding: '12px 20px',
            marginBottom: 12,
            border: '1px solid rgba(255,255,255,0.1)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, alignItems: 'center' }}>
              {selected.map((id, i) => {
                const card = PECS_CARDS.find(c => c.id === id);
                return (
                  <div key={id} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: 20 }}>{card?.emoji}</span>
                    <span style={{ fontSize: 15, color: '#c4b5fd', fontWeight: 700 }}>{card?.label}</span>
                    {i < selected.length - 1 && <span style={{ color: '#64748b', margin: '0 4px' }}>+</span>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {completed && (
          <p className="minigame-success animate-success-scale">
            ✅ &quot;나 할 수 있어 퍼즐&quot; - 메시지 완성!
          </p>
        )}
      </div>
    </div>
  );
}
