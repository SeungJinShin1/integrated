'use client';

import { useState, useEffect } from 'react';
import ParticleCanvas from './ParticleCanvas';

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
  const waveColor = value > 60 ? '#ef4444' : value > 30 ? '#f59e0b' : '#22c55e';

  return (
    <div className="minigame-card" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Animated waveform background */}
      <ParticleCanvas
        width={500}
        height={300}
        effect={completed ? 'success' : 'waveform'}
        active={true}
        waveValue={value}
        color={waveColor}
        intensity={completed ? 2 : 1}
      />

      <div style={{ position: 'relative', zIndex: 5 }}>
        <p className="minigame-title">헤드셋 다이얼을 조절하세요</p>

        {/* Visual meter */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', marginBottom: 16
        }}>
          <span style={{ fontSize: 12, fontWeight: 800, color: '#94a3b8', width: 28, textAlign: 'center' }}>큰</span>
          <div style={{
            width: '100%', maxWidth: 300, height: 16, borderRadius: 8,
            background: 'rgba(255,255,255,0.1)', overflow: 'hidden', position: 'relative',
          }}>
            <div style={{
              width: `${value}%`, height: '100%', borderRadius: 8,
              background: `linear-gradient(90deg, #22c55e, ${barColor})`,
              transition: 'all 0.3s',
              boxShadow: `0 0 12px ${barColor}60`,
            }} />
            {/* Animated pulse along bar */}
            {!completed && (
              <div style={{
                position: 'absolute', top: 0, left: 0, width: `${value}%`, height: '100%',
                background: `linear-gradient(90deg, transparent, ${barColor}40, transparent)`,
                animation: 'pulse 1.5s infinite',
              }} />
            )}
          </div>
          <span style={{ fontSize: 12, fontWeight: 800, color: '#94a3b8', width: 28, textAlign: 'center' }}>작</span>
        </div>

        {/* Noise level indicator */}
        <div style={{
          display: 'flex', justifyContent: 'center', gap: 4, marginBottom: 12,
        }}>
          {[...Array(10)].map((_, i) => (
            <div key={i} style={{
              width: 6, borderRadius: 3,
              height: 8 + Math.random() * 20 * (value / 100),
              background: i < Math.ceil(value / 10) ? barColor : 'rgba(255,255,255,0.1)',
              transition: 'all 0.3s',
              animation: !completed && i < Math.ceil(value / 10) ? `float ${0.5 + Math.random() * 0.5}s ease-in-out infinite` : 'none',
            }} />
          ))}
        </div>

        <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 12 }}>
          소음 수치: <span style={{ color: barColor, fontWeight: 800 }}>{value}%</span>
        </p>

        <input
          type="range"
          min={0} max={100}
          value={value}
          onChange={e => setValue(parseInt(e.target.value))}
          style={{
            width: '100%', accentColor: barColor,
            opacity: completed ? 0.5 : 1,
          }}
          disabled={completed}
        />

        {completed && (
          <p className="minigame-success animate-success-scale">소음이 줄었습니다!</p>
        )}
      </div>
    </div>
  );
}
