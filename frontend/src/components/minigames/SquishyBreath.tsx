'use client';

import { useState, useEffect } from 'react';

export default function SquishyBreath({ onComplete }: { onComplete: () => void }) {
  const [count, setCount] = useState(0);
  const [pressing, setPressing] = useState(false);
  const [size, setSize] = useState(60);
  const maxCount = 5;

  useEffect(() => {
    if (count >= maxCount) {
      setTimeout(onComplete, 600);
    }
  }, [count, onComplete]);

  const handlePress = () => {
    setPressing(true);
    setSize(90);
  };

  const handleRelease = () => {
    setPressing(false);
    setSize(60);
    setCount(prev => prev + 1);
  };

  return (
    <div style={{ background: 'rgba(255,255,255,0.95)', borderRadius: 20, padding: 24, boxShadow: '0 16px 40px rgba(0,0,0,0.3)', textAlign: 'center' }}>
      <p style={{ fontSize: 14, fontWeight: 700, color: '#334155', marginBottom: 16 }}>🫧 말랑이를 꾹 눌렀다 놓기 ({count}/{maxCount})</p>
      <div
        onMouseDown={handlePress} onMouseUp={handleRelease} onMouseLeave={() => { if (pressing) handleRelease(); }}
        onTouchStart={handlePress} onTouchEnd={handleRelease}
        style={{
          width: size, height: size, borderRadius: '50%',
          background: pressing ? 'linear-gradient(135deg, #f472b6, #ec4899)' : 'linear-gradient(135deg, #818cf8, #6366f1)',
          margin: '0 auto', cursor: 'pointer', transition: 'all 0.2s',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: pressing ? '0 0 30px rgba(236,72,153,0.5)' : '0 4px 16px rgba(99,102,241,0.3)',
        }}>
        <span style={{ fontSize: 28, userSelect: 'none' }}>{pressing ? '😊' : '🫧'}</span>
      </div>
      {count >= maxCount && <p style={{ marginTop: 12, color: '#16a34a', fontWeight: 700 }}>✅ 마음이 차분해졌어요!</p>}
    </div>
  );
}
