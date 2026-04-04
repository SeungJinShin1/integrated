'use client';

import { useState, useEffect, useRef } from 'react';
import ParticleCanvas from './ParticleCanvas';

export default function TimerDial({ onComplete }: { onComplete: () => void }) {
  const [time, setTime] = useState(100);
  const [running, setRunning] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  // Draw circular timer on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 180;
    canvas.width = size;
    canvas.height = size;
    const cx = size / 2;
    const cy = size / 2;
    const radius = 70;

    const draw = () => {
      ctx.clearRect(0, 0, size, size);

      // Outer glow ring
      const gradient = ctx.createRadialGradient(cx, cy, radius - 10, cx, cy, radius + 20);
      const hue = time > 50 ? 0 : time > 20 ? 40 : 140;
      gradient.addColorStop(0, `hsla(${hue}, 80%, 50%, 0.1)`);
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);

      // Track ring
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.lineWidth = 10;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();

      // Progress arc
      const progress = time / 100;
      const startAngle = -Math.PI / 2;
      const endAngle = startAngle + progress * Math.PI * 2;
      const color = time > 50 ? '#ef4444' : time > 20 ? '#f59e0b' : '#22c55e';

      ctx.strokeStyle = color;
      ctx.lineWidth = 10;
      ctx.lineCap = 'round';
      ctx.shadowColor = color;
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, startAngle, endAngle);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Head dot
      const headX = cx + Math.cos(endAngle) * radius;
      const headY = cy + Math.sin(endAngle) * radius;
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(headX, headY, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowColor = color;
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Trail particles
      if (running && time > 0) {
        for (let i = 0; i < 3; i++) {
          const trailAngle = endAngle - (i + 1) * 0.15;
          const tx = cx + Math.cos(trailAngle) * radius + (Math.random() - 0.5) * 8;
          const ty = cy + Math.sin(trailAngle) * radius + (Math.random() - 0.5) * 8;
          ctx.fillStyle = color + '60';
          ctx.beginPath();
          ctx.arc(tx, ty, 2 + Math.random() * 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Center text
      ctx.fillStyle = '#e2e8f0';
      ctx.font = 'bold 36px "Nanum Gothic", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${Math.ceil(time / 20)}`, cx, cy - 8);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px "Nanum Gothic", sans-serif';
      ctx.fillText(time > 0 ? '남은 시간' : '완료!', cx, cy + 22);
    };

    draw();
    if (running) {
      const animate = () => {
        draw();
        animRef.current = requestAnimationFrame(animate);
      };
      animate();
      return () => cancelAnimationFrame(animRef.current);
    }
  }, [time, running]);

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
    <div className="minigame-card" style={{ position: 'relative', overflow: 'hidden' }}>
      <ParticleCanvas
        width={500}
        height={350}
        effect={time <= 0 ? 'success' : 'ambient'}
        active={running}
        intensity={time <= 0 ? 2 : 0.3}
        color={time > 50 ? '#ef4444' : time > 20 ? '#f59e0b' : '#22c55e'}
      />

      <div style={{ position: 'relative', zIndex: 5 }}>
        <p className="minigame-title">⏳ 비주얼 타이머</p>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <canvas ref={canvasRef} style={{ borderRadius: '50%' }} />
        </div>
        {!running ? (
          <button
            onClick={() => setRunning(true)}
            className="animate-glow-pulse"
            style={{
              padding: '12px 36px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: 'white', borderRadius: 16, border: 'none',
              fontSize: 16, fontWeight: 700, cursor: 'pointer',
              fontFamily: "'Nanum Gothic', sans-serif",
              boxShadow: '0 8px 24px rgba(99,102,241,0.4)',
              transition: 'all 0.2s',
            }}>
            ▶ 타이머 시작
          </button>
        ) : time > 0 ? (
          <p style={{ fontSize: 14, color: '#94a3b8' }}>타이머가 작동 중...</p>
        ) : (
          <p className="minigame-success animate-success-scale">✅ 시간 종료!</p>
        )}
      </div>
    </div>
  );
}
