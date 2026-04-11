'use client';

import { useRef, useEffect, useState } from 'react';
import ParticleCanvas from './ParticleCanvas';

interface ScratchFogProps {
  bgImage: string;
  onComplete: () => void;
  ribbonImage?: string;
}

export default function ScratchFog({ bgImage, onComplete, ribbonImage }: ScratchFogProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scratched, setScratched] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [showRibbons, setShowRibbons] = useState(false);
  const [fogCleared, setFogCleared] = useState(false);
  const isDrawing = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 340;
    canvas.height = 220;

    // Fog gradient
    const gradient = ctx.createLinearGradient(0, 0, 340, 220);
    gradient.addColorStop(0, 'rgba(71, 85, 105, 0.92)');
    gradient.addColorStop(0.5, 'rgba(100, 116, 139, 0.95)');
    gradient.addColorStop(1, 'rgba(51, 65, 85, 0.92)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 340, 220);

    // Fog texture pattern
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * 340;
      const y = Math.random() * 220;
      const r = 10 + Math.random() * 30;
      const fogGrad = ctx.createRadialGradient(x, y, 0, x, y, r);
      fogGrad.addColorStop(0, 'rgba(148,163,184,0.15)');
      fogGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = fogGrad;
      ctx.fillRect(x - r, y - r, r * 2, r * 2);
    }

    ctx.font = 'bold 16px "Nanum Gothic", sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.textAlign = 'center';
    ctx.fillText('여기를 문질러 주세요', 170, 110);
  }, []);

  const scratch = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Erase with soft edge
    ctx.globalCompositeOperation = 'destination-out';
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, 28);
    gradient.addColorStop(0, 'rgba(0,0,0,1)');
    gradient.addColorStop(0.7, 'rgba(0,0,0,0.5)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, 28, 0, Math.PI * 2);
    ctx.fill();

    const imageData = ctx.getImageData(0, 0, 340, 220);
    let transparent = 0;
    for (let i = 3; i < imageData.data.length; i += 4) {
      if (imageData.data[i] < 50) transparent++;
    }
    const pct = (transparent / (340 * 220)) * 100;
    setScratched(pct);

    if (pct > 75 && !fogCleared) {
      setFogCleared(true);
      setShowRibbons(true);
    }
  };

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ('touches' in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: ((e as React.MouseEvent).clientX - rect.left) * scaleX,
      y: ((e as React.MouseEvent).clientY - rect.top) * scaleY,
    };
  };

  return (
    <div className="minigame-card" style={{ position: 'relative', overflow: 'hidden' }}>
      <ParticleCanvas
        width={500}
        height={400}
        effect={completed ? 'firework' : 'ambient'}
        active={true}
        intensity={completed ? 2 : 0.3}
        color={completed ? '#fbbf24' : '#94a3b8'}
      />

      <div style={{ position: 'relative', zIndex: 5 }}>
        <p className="minigame-title">안개를 문질러 지우세요!</p>

        <div style={{
          position: 'relative',
          width: 340,
          height: 220,
          margin: '0 auto',
          borderRadius: 16,
          overflow: 'hidden',
          border: '2px solid rgba(255,255,255,0.15)',
          boxShadow: completed ? '0 0 30px rgba(251,191,36,0.4)' : '0 8px 24px rgba(0,0,0,0.3)',
          transition: 'box-shadow 0.5s',
        }}>
          {/* Background image (map or custom) */}
          <img
            src={bgImage}
            alt="map"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              position: 'absolute',
              inset: 0,
            }}
          />

          {/* Yellow ribbons revealed under fog */}
          {ribbonImage && (
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 20,
              zIndex: fogCleared ? 20 : 1,
              pointerEvents: 'none',
            }}>
              <img
                src={ribbonImage}
                alt="노란 리본"
                className={showRibbons ? 'animate-ribbon-reveal' : ''}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  if (fogCleared && !completed) {
                    setCompleted(true);
                    onComplete();
                  }
                }}
                onTouchEnd={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  if (fogCleared && !completed) {
                    setCompleted(true);
                    onComplete();
                  }
                }}
                style={{
                  width: 90,
                  height: 90,
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 4px 12px rgba(251,191,36,0.8))',
                  opacity: scratched > 30 ? Math.min(1, (scratched - 30) / 45) : 0,
                  transition: 'opacity 0.5s',
                  cursor: fogCleared && !completed ? 'pointer' : 'default',
                  pointerEvents: fogCleared && !completed ? 'auto' : 'none',
                  animation: fogCleared && !completed ? 'pulse 1.5s infinite' : 'none',
                  zIndex: 30, // pull to front to prevent canvas overlapping clicks
                }}
              />
            </div>
          )}

          {/* Fog canvas overlay */}
          <canvas
            ref={canvasRef}
            style={{
              position: 'absolute',
              inset: 0,
              cursor: completed ? 'default' : 'pointer',
              zIndex: 2,
              pointerEvents: fogCleared ? 'none' : 'auto',
              width: '100%',
              height: '100%',
            }}
            onMouseDown={() => { isDrawing.current = true; }}
            onMouseUp={() => { isDrawing.current = false; }}
            onMouseLeave={() => { isDrawing.current = false; }}
            onMouseMove={(e) => { if (isDrawing.current && !completed) { const { x, y } = getPos(e); scratch(x, y); } }}
            onTouchStart={() => { isDrawing.current = true; }}
            onTouchEnd={() => { isDrawing.current = false; }}
            onTouchMove={(e) => { if (isDrawing.current && !completed) { const { x, y } = getPos(e); scratch(x, y); } }}
          />
        </div>

        {/* Progress bar */}
        <div style={{ 
          width: 340, margin: '12px auto 0', 
          background: 'rgba(255,255,255,0.1)', 
          borderRadius: 8, height: 8, overflow: 'hidden' 
        }}>
          <div style={{
            width: `${Math.min(100, scratched / 55 * 100)}%`,
            height: '100%',
            background: completed
              ? 'linear-gradient(90deg, #fbbf24, #f59e0b)'
              : 'linear-gradient(90deg, #818cf8, #a78bfa)',
            borderRadius: 8,
            transition: 'all 0.3s',
            boxShadow: completed ? '0 0 8px rgba(251,191,36,0.5)' : 'none',
          }} />
        </div>
        <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 6 }}>
          진행: {Math.round(Math.min(100, scratched / 75 * 100))}%
        </p>

        {fogCleared && !completed && (
          <p className="minigame-success animate-success-scale" style={{ marginTop: 8, color: '#fbbf24' }}>
            리본을 터치하세요!
          </p>
        )}
        {completed && (
          <p className="minigame-success animate-success-scale" style={{ marginTop: 8 }}>
            노란 리본을 발견했어요!
          </p>
        )}
      </div>
    </div>
  );
}
