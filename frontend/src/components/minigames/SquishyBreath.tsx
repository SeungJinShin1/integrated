'use client';

import { useState, useEffect, useRef } from 'react';
import ParticleCanvas from './ParticleCanvas';

export default function SquishyBreath({ onComplete }: { onComplete: () => void }) {
  const [count, setCount] = useState(0);
  const [pressing, setPressing] = useState(false);
  const [size, setSize] = useState(80);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const maxCount = 5;
  const rippleId = useRef(0);

  useEffect(() => {
    if (count >= maxCount) {
      setTimeout(onComplete, 600);
    }
  }, [count, onComplete]);

  const handlePress = () => {
    setPressing(true);
    setSize(110);
  };

  const handleRelease = () => {
    setPressing(false);
    setSize(80);
    setCount(prev => prev + 1);
    // Add ripple
    rippleId.current++;
    setRipples(prev => [...prev, { id: rippleId.current, x: 0, y: 0 }]);
    setTimeout(() => setRipples(prev => prev.slice(1)), 1000);
  };

  const isComplete = count >= maxCount;

  return (
    <div className="minigame-card" style={{ position: 'relative', overflow: 'hidden' }}>
      <ParticleCanvas
        width={500}
        height={380}
        effect={isComplete ? 'firework' : 'ambient'}
        active={true}
        intensity={isComplete ? 2 : 0.4}
        color={pressing ? '#ec4899' : '#818cf8'}
      />

      <div style={{ position: 'relative', zIndex: 5 }}>
        <p className="minigame-title">
          🫧 말랑이를 꾹 눌렀다 놓기 ({count}/{maxCount})
        </p>

        {/* Progress dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 20 }}>
          {[...Array(maxCount)].map((_, i) => (
            <div key={i} style={{
              width: 14, height: 14, borderRadius: '50%',
              background: i < count
                ? 'linear-gradient(135deg, #ec4899, #a855f7)'
                : 'rgba(255,255,255,0.12)',
              border: i < count ? '2px solid #f9a8d4' : '2px solid rgba(255,255,255,0.08)',
              transition: 'all 0.3s',
              transform: i < count ? 'scale(1.1)' : 'scale(1)',
              boxShadow: i < count ? '0 0 8px rgba(236,72,153,0.4)' : 'none',
            }} />
          ))}
        </div>

        {/* Squishy ball */}
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          {/* Ripple rings */}
          {ripples.map(r => (
            <div key={r.id} style={{
              position: 'absolute',
              width: size,
              height: size,
              borderRadius: '50%',
              border: '2px solid',
              borderColor: pressing ? 'rgba(236,72,153,0.3)' : 'rgba(99,102,241,0.3)',
              animation: 'ping 1s ease-out forwards',
            }} />
          ))}

          <div
            onMouseDown={handlePress}
            onMouseUp={handleRelease}
            onMouseLeave={() => { if (pressing) handleRelease(); }}
            onTouchStart={handlePress}
            onTouchEnd={handleRelease}
            style={{
              width: size,
              height: size,
              borderRadius: '50%',
              background: pressing
                ? 'radial-gradient(circle at 40% 35%, #f9a8d4, #ec4899, #be185d)'
                : 'radial-gradient(circle at 40% 35%, #c4b5fd, #818cf8, #4f46e5)',
              margin: '0 auto',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: pressing
                ? '0 0 40px rgba(236,72,153,0.5), inset 0 -4px 12px rgba(0,0,0,0.2)'
                : '0 8px 24px rgba(99,102,241,0.3), inset 0 -4px 12px rgba(0,0,0,0.2)',
              userSelect: 'none',
            }}>
            <span style={{
              fontSize: 16,
              fontWeight: 800,
              color: 'rgba(255,255,255,0.9)',
              letterSpacing: 0.5,
              transition: 'transform 0.15s',
              transform: pressing ? 'scale(0.85)' : 'scale(1)',
            }}>
              {pressing ? '꾹' : isComplete ? '완료' : '꾹 누르기'}
            </span>
          </div>
        </div>

        {isComplete && (
          <p className="minigame-success animate-success-scale" style={{ marginTop: 20 }}>
            마음이 차분해졌어요!
          </p>
        )}
      </div>
    </div>
  );
}
