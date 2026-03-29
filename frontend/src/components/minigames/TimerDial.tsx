'use client';

import { useState, useEffect } from 'react';

export default function TimerDial({ onComplete }: { onComplete: () => void }) {
  const [time, setTime] = useState(100);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      setTime(prev => {
        if (prev <= 0) { clearInterval(interval); onComplete(); return 0; }
        return prev - 2;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [running, onComplete]);

  return (
    <div style={{ background: 'rgba(255,255,255,0.95)', borderRadius: 20, padding: 24, boxShadow: '0 16px 40px rgba(0,0,0,0.3)', textAlign: 'center' }}>
      <p style={{ fontSize: 14, fontWeight: 700, color: '#334155', marginBottom: 16 }}>⏳ 비주얼 타이머</p>
      <div style={{ width: 120, height: 120, borderRadius: '50%', border: '6px solid #e2e8f0', margin: '0 auto 16px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: `${time}%`, background: time > 50 ? '#ef4444' : time > 20 ? '#f59e0b' : '#22c55e', transition: 'all 0.3s', borderRadius: '0 0 50% 50%' }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 800, color: '#334155' }}>{Math.ceil(time / 20)}</div>
      </div>
      {!running ? (
        <button onClick={() => setRunning(true)} style={{ padding: '10px 32px', background: '#6366f1', color: 'white', borderRadius: 12, border: 'none', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: "'Nanum Gothic', sans-serif" }}>타이머 시작</button>
      ) : (
        <p style={{ fontSize: 13, color: '#64748b' }}>타이머가 작동 중...</p>
      )}
    </div>
  );
}
