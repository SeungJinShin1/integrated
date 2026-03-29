'use client';

import { useState, useRef, useEffect } from 'react';

interface WaveformSliderProps {
  onComplete: () => void;
}

export default function WaveformSlider({ onComplete }: WaveformSliderProps) {
  const [value, setValue] = useState(80);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (value <= 20 && !completed) {
      setCompleted(true);
      setTimeout(onComplete, 800);
    }
  }, [value, completed, onComplete]);

  const barColor = value > 60 ? '#ef4444' : value > 30 ? '#f59e0b' : '#22c55e';

  return (
    <div style={{
      background: 'rgba(255,255,255,0.95)', borderRadius: 20, padding: 24,
      boxShadow: '0 16px 40px rgba(0,0,0,0.3)', textAlign: 'center',
    }}>
      <p style={{ fontSize: 14, fontWeight: 700, color: '#334155', marginBottom: 16 }}>
        🎧 헤드셋 다이얼을 조절하세요
      </p>
      <div style={{
        width: '100%', height: 24, borderRadius: 12, background: '#f1f5f9',
        overflow: 'hidden', marginBottom: 12,
      }}>
        <div style={{
          width: `${value}%`, height: '100%', borderRadius: 12,
          background: barColor, transition: 'all 0.3s',
        }} />
      </div>
      <p style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>소음 수치: {value}%</p>
      <input type="range" min={0} max={100} value={value}
        onChange={e => setValue(parseInt(e.target.value))}
        style={{ width: '100%', accentColor: '#6366f1' }}
        disabled={completed} />
      {completed && <p style={{ marginTop: 12, color: '#16a34a', fontWeight: 700 }}>✅ 소음이 줄었습니다!</p>}
    </div>
  );
}
