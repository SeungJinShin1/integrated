'use client';

import { useEffect, useState } from 'react';

interface StageTransitionProps {
  targetStage: string;
  onComplete: () => void;
}

export default function StageTransition({ targetStage, onComplete }: StageTransitionProps) {
  const [phase, setPhase] = useState<'fadein' | 'show' | 'fadeout'>('fadein');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('show'), 400);
    const t2 = setTimeout(() => setPhase('fadeout'), 1200);
    const t3 = setTimeout(() => onComplete(), 1800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 99999,
      background: '#0f172a',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      opacity: phase === 'fadein' ? 0 : phase === 'show' ? 1 : 0,
      transition: 'opacity 0.4s ease',
    }}>
      <div style={{ textAlign: 'center', color: 'white' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🌟</div>
        <div style={{ fontSize: 18, fontWeight: 700, opacity: 0.9 }}>Loading...</div>
      </div>
    </div>
  );
}
