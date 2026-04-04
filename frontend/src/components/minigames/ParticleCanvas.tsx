'use client';

import { useRef, useEffect, useCallback } from 'react';

// ===== Particle Types =====
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  type: 'circle' | 'star' | 'ring' | 'spark' | 'bubble';
  rotation: number;
  rotationSpeed: number;
  gravity: number;
  friction: number;
  opacity: number;
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  opacity: number;
  color: string;
}

export type EffectType = 'success' | 'fail' | 'ambient' | 'ripple' | 'waveform' | 'firework';

interface ParticleCanvasProps {
  width?: number;
  height?: number;
  effect?: EffectType;
  active?: boolean;
  color?: string;
  intensity?: number;
  style?: React.CSSProperties;
  className?: string;
  waveValue?: number; // 0-100 for waveform effect
  onCanvasClick?: (x: number, y: number) => void;
}

// ===== Color Palettes =====
const PALETTES = {
  success: ['#22c55e', '#4ade80', '#86efac', '#fbbf24', '#f59e0b', '#a855f7', '#ec4899'],
  fail: ['#ef4444', '#f87171', '#fca5a5', '#fb923c'],
  ambient: ['#818cf8', '#a78bfa', '#c4b5fd', '#93c5fd', '#67e8f9', '#6ee7b7'],
  firework: ['#fbbf24', '#f59e0b', '#ef4444', '#ec4899', '#a855f7', '#3b82f6', '#22c55e', '#06b6d4'],
  ripple: ['#818cf8', '#6366f1', '#a78bfa'],
};

// ===== Star Drawing =====
function drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, spikes: number, outerR: number, innerR: number) {
  let rot = Math.PI / 2 * 3;
  const step = Math.PI / spikes;
  ctx.beginPath();
  ctx.moveTo(cx, cy - outerR);
  for (let i = 0; i < spikes; i++) {
    ctx.lineTo(cx + Math.cos(rot) * outerR, cy + Math.sin(rot) * outerR);
    rot += step;
    ctx.lineTo(cx + Math.cos(rot) * innerR, cy + Math.sin(rot) * innerR);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerR);
  ctx.closePath();
}

function createParticle(x: number, y: number, palette: string[], type: Particle['type'] = 'circle', opts?: Partial<Particle>): Particle {
  const angle = Math.random() * Math.PI * 2;
  const speed = 1 + Math.random() * 4;
  return {
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    life: 1,
    maxLife: 60 + Math.random() * 60,
    size: 3 + Math.random() * 6,
    color: palette[Math.floor(Math.random() * palette.length)],
    type,
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: (Math.random() - 0.5) * 0.1,
    gravity: 0.02,
    friction: 0.99,
    opacity: 1,
    ...opts,
  };
}

// ===== Main Component =====
export default function ParticleCanvas({
  width = 400,
  height = 300,
  effect = 'ambient',
  active = true,
  color,
  intensity = 1,
  style,
  className,
  waveValue = 50,
  onCanvasClick,
}: ParticleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const ripples = useRef<Ripple[]>([]);
  const animRef = useRef<number>(0);
  const frameCount = useRef(0);

  const spawnSuccessParticles = useCallback((cx: number, cy: number) => {
    const palette = color ? [color, ...PALETTES.success] : PALETTES.success;
    for (let i = 0; i < 30 * intensity; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 6;
      particles.current.push(createParticle(cx, cy, palette, Math.random() > 0.5 ? 'star' : 'spark', {
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        gravity: 0.06,
        maxLife: 40 + Math.random() * 40,
        size: 4 + Math.random() * 8,
      }));
    }
  }, [color, intensity]);

  const spawnFirework = useCallback((cx: number, cy: number) => {
    const palette = PALETTES.firework;
    for (let i = 0; i < 50 * intensity; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 8;
      particles.current.push(createParticle(cx, cy, palette, Math.random() > 0.3 ? 'star' : 'circle', {
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        gravity: 0.04,
        friction: 0.97,
        maxLife: 50 + Math.random() * 50,
        size: 2 + Math.random() * 6,
      }));
    }
  }, [intensity]);

  const spawnRipple = useCallback((cx: number, cy: number) => {
    const palette = color ? [color] : PALETTES.ripple;
    ripples.current.push({
      x: cx, y: cy, radius: 0,
      maxRadius: 60 + Math.random() * 40,
      opacity: 0.6,
      color: palette[Math.floor(Math.random() * palette.length)],
    });
  }, [color]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      frameCount.current++;

      if (active) {
        // Ambient particles
        if (effect === 'ambient' && frameCount.current % Math.max(1, Math.round(4 / intensity)) === 0) {
          const palette = color ? [color, ...PALETTES.ambient] : PALETTES.ambient;
          particles.current.push(createParticle(
            Math.random() * width,
            height + 10,
            palette,
            Math.random() > 0.5 ? 'bubble' : 'circle',
            { vy: -0.5 - Math.random() * 1.5, vx: (Math.random() - 0.5) * 0.5, gravity: -0.01, maxLife: 120 + Math.random() * 60, size: 2 + Math.random() * 4 }
          ));
        }

        // Waveform
        if (effect === 'waveform') {
          ctx.strokeStyle = color || '#818cf8';
          ctx.lineWidth = 2;
          ctx.beginPath();
          const amp = (waveValue / 100) * (height * 0.35);
          const freq = 0.02 + (waveValue / 100) * 0.04;
          for (let x = 0; x < width; x++) {
            const y = height / 2 + Math.sin(x * freq + frameCount.current * 0.05) * amp * Math.sin(x * 0.005 + frameCount.current * 0.02)
              + Math.sin(x * freq * 2.3 + frameCount.current * 0.08) * amp * 0.3;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();

          // Secondary wave
          ctx.strokeStyle = (color || '#818cf8') + '40';
          ctx.lineWidth = 1;
          ctx.beginPath();
          for (let x = 0; x < width; x++) {
            const y = height / 2 + Math.sin(x * freq * 1.5 + frameCount.current * 0.03 + 1) * amp * 0.6;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();

          // Floating dots along wave
          if (frameCount.current % 3 === 0) {
            const palette = waveValue > 60 ? ['#ef4444', '#f87171'] : waveValue > 30 ? ['#f59e0b', '#fbbf24'] : ['#22c55e', '#4ade80'];
            const x = Math.random() * width;
            const y = height / 2 + Math.sin(x * freq + frameCount.current * 0.05) * amp;
            particles.current.push(createParticle(x, y, palette, 'circle', {
              vy: -0.3 - Math.random() * 0.5, vx: (Math.random() - 0.5) * 0.3,
              gravity: -0.005, maxLife: 40, size: 2 + Math.random() * 3,
            }));
          }
        }
      }

      // Update & draw particles
      particles.current = particles.current.filter(p => {
        p.life++;
        p.vx *= p.friction;
        p.vy *= p.friction;
        p.vy += p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;

        const progress = p.life / p.maxLife;
        p.opacity = progress < 0.2 ? progress * 5 : 1 - ((progress - 0.2) / 0.8);
        if (p.opacity <= 0) return false;

        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);

        switch (p.type) {
          case 'star':
            ctx.fillStyle = p.color;
            drawStar(ctx, 0, 0, 5, p.size, p.size * 0.4);
            ctx.fill();
            break;
          case 'spark':
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.size * 0.15, -p.size, p.size * 0.3, p.size * 2);
            ctx.fillRect(-p.size, -p.size * 0.15, p.size * 2, p.size * 0.3);
            break;
          case 'ring':
            ctx.strokeStyle = p.color;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(0, 0, p.size, 0, Math.PI * 2);
            ctx.stroke();
            break;
          case 'bubble':
            ctx.fillStyle = p.color + '30';
            ctx.strokeStyle = p.color + '60';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(0, 0, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            // Highlight
            ctx.fillStyle = 'rgba(255,255,255,0.4)';
            ctx.beginPath();
            ctx.arc(-p.size * 0.3, -p.size * 0.3, p.size * 0.25, 0, Math.PI * 2);
            ctx.fill();
            break;
          default:
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(0, 0, p.size * (1 - progress * 0.5), 0, Math.PI * 2);
            ctx.fill();
            // Glow
            ctx.shadowColor = p.color;
            ctx.shadowBlur = p.size * 2;
            ctx.fill();
            ctx.shadowBlur = 0;
        }

        ctx.restore();
        return p.life < p.maxLife;
      });

      // Update & draw ripples
      ripples.current = ripples.current.filter(r => {
        r.radius += 2;
        r.opacity -= 0.015;
        if (r.opacity <= 0) return false;

        ctx.save();
        ctx.globalAlpha = r.opacity;
        ctx.strokeStyle = r.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
        return true;
      });

      animRef.current = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animRef.current);
  }, [width, height, effect, active, color, intensity, waveValue]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    if (effect === 'success' || effect === 'firework') {
      spawnFirework(x, y);
    } else {
      spawnRipple(x, y);
      spawnSuccessParticles(x, y);
    }
    onCanvasClick?.(x, y);
  };

  return (
    <canvas
      ref={canvasRef}
      className={className}
      onClick={handleClick}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: onCanvasClick ? 'auto' : 'none',
        zIndex: 1,
        ...style,
      }}
    />
  );
}

// ===== Export helper: spawn burst at position =====
export function useParticleBurst() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particles = useRef<Particle[]>([]);
  const animRef = useRef<number>(0);

  const burst = useCallback((canvas: HTMLCanvasElement, x: number, y: number, palette: string[] = PALETTES.success) => {
    canvasRef.current = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    for (let i = 0; i < 25; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 5;
      particles.current.push(createParticle(x, y, palette, Math.random() > 0.3 ? 'star' : 'spark', {
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1,
        gravity: 0.05,
        maxLife: 40 + Math.random() * 30,
        size: 3 + Math.random() * 7,
      }));
    }

    const animate = () => {
      if (!canvasRef.current) return;
      const c = canvasRef.current.getContext('2d');
      if (!c) return;
      c.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

      particles.current = particles.current.filter(p => {
        p.life++;
        p.vx *= p.friction;
        p.vy *= p.friction;
        p.vy += p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        const progress = p.life / p.maxLife;
        p.opacity = 1 - progress;
        if (p.opacity <= 0) return false;

        c.save();
        c.globalAlpha = p.opacity;
        c.translate(p.x, p.y);
        c.rotate(p.rotation);
        c.fillStyle = p.color;

        if (p.type === 'star') {
          drawStar(c, 0, 0, 5, p.size, p.size * 0.4);
          c.fill();
        } else if (p.type === 'spark') {
          c.fillRect(-p.size * 0.15, -p.size, p.size * 0.3, p.size * 2);
          c.fillRect(-p.size, -p.size * 0.15, p.size * 2, p.size * 0.3);
        } else {
          c.beginPath();
          c.arc(0, 0, p.size, 0, Math.PI * 2);
          c.fill();
        }
        c.restore();
        return p.life < p.maxLife;
      });

      if (particles.current.length > 0) {
        animRef.current = requestAnimationFrame(animate);
      }
    };
    cancelAnimationFrame(animRef.current);
    animate();
  }, []);

  return burst;
}
