'use client';

import { useRef, useEffect, useState } from 'react';

export default function ScratchFog({ bgImage, onComplete }: { bgImage: string; onComplete: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scratched, setScratched] = useState(0);
  const isDrawing = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 300;
    canvas.height = 200;
    ctx.fillStyle = 'rgba(100, 116, 139, 0.9)';
    ctx.fillRect(0, 0, 300, 200);

    ctx.font = 'bold 16px "Nanum Gothic", sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.textAlign = 'center';
    ctx.fillText('🖐️ 여기를 문질러 주세요', 150, 105);
  }, []);

  const scratch = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.fill();

    const imageData = ctx.getImageData(0, 0, 300, 200);
    let transparent = 0;
    for (let i = 3; i < imageData.data.length; i += 4) {
      if (imageData.data[i] === 0) transparent++;
    }
    const pct = (transparent / (300 * 200)) * 100;
    setScratched(pct);
    if (pct > 60) onComplete();
  };

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top };
  };

  return (
    <div style={{ background: 'rgba(255,255,255,0.95)', borderRadius: 20, padding: 24, boxShadow: '0 16px 40px rgba(0,0,0,0.3)', textAlign: 'center' }}>
      <p style={{ fontSize: 14, fontWeight: 700, color: '#334155', marginBottom: 12 }}>🖐️ 안개를 문질러 지우세요!</p>
      <div style={{ position: 'relative', width: 300, height: 200, margin: '0 auto', borderRadius: 12, overflow: 'hidden' }}>
        <img src={bgImage} alt="map" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, cursor: 'pointer' }}
          onMouseDown={() => { isDrawing.current = true; }}
          onMouseUp={() => { isDrawing.current = false; }}
          onMouseLeave={() => { isDrawing.current = false; }}
          onMouseMove={(e) => { if (isDrawing.current) { const { x, y } = getPos(e); scratch(x, y); } }}
          onTouchStart={() => { isDrawing.current = true; }}
          onTouchEnd={() => { isDrawing.current = false; }}
          onTouchMove={(e) => { if (isDrawing.current) { const { x, y } = getPos(e); scratch(x, y); } }}
        />
      </div>
      <p style={{ fontSize: 12, color: '#64748b', marginTop: 8 }}>진행: {Math.round(scratched)}%</p>
    </div>
  );
}
