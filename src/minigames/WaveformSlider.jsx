import { useRef, useEffect, useState, useCallback } from 'react';

export default function WaveformSlider({ onComplete }) {
    const canvasRef = useRef(null);
    const animRef = useRef(null);
    const [volume, setVolume] = useState(100); // 0~100
    const volumeRef = useRef(100);
    const lastMoveTime = useRef(Date.now());
    const [completed, setCompleted] = useState(false);
    const calmTimer = useRef(null);
    const isDragging = useRef(false);
    const sliderRef = useRef(null);

    // 파형 그리기
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let t = 0;

        const draw = () => {
            const w = canvas.width, h = canvas.height;
            ctx.clearRect(0, 0, w, h);
            const vol = volumeRef.current / 100;
            const amplitude = vol * (h / 2 - 10);
            const freq = 0.02 + vol * 0.03;

            // 그라데이션 색상: 빨강(높음) → 초록(낮음)
            const r = Math.round(239 * vol + 34 * (1 - vol));
            const g = Math.round(68 * vol + 197 * (1 - vol));
            const b = Math.round(68 * vol + 94 * (1 - vol));

            ctx.strokeStyle = `rgb(${r},${g},${b})`;
            ctx.lineWidth = 3;
            ctx.shadowColor = `rgba(${r},${g},${b},0.5)`;
            ctx.shadowBlur = 10;
            ctx.beginPath();
            for (let x = 0; x < w; x++) {
                const noise = vol > 0.1 ? (Math.random() - 0.5) * amplitude * 0.3 : 0;
                const y = h / 2 + Math.sin(x * freq + t) * amplitude + noise;
                x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            }
            ctx.stroke();
            ctx.shadowBlur = 0;

            // 중앙선 표시 (목표를 나타냄)
            if (vol < 0.15) {
                ctx.strokeStyle = 'rgba(34,197,94,0.3)';
                ctx.lineWidth = 1;
                ctx.setLineDash([5, 5]);
                ctx.beginPath(); ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2); ctx.stroke();
                ctx.setLineDash([]);
            }

            t += 0.05 + vol * 0.15;
            animRef.current = requestAnimationFrame(draw);
        };
        draw();
        return () => cancelAnimationFrame(animRef.current);
    }, []);

    // Calm 타이머: 볼륨이 10 이하로 1초 유지 시 완료
    useEffect(() => {
        if (completed) return;
        if (volume <= 10) {
            if (!calmTimer.current) {
                calmTimer.current = setTimeout(() => {
                    setCompleted(true);
                    onComplete();
                }, 1200);
            }
        } else {
            if (calmTimer.current) { clearTimeout(calmTimer.current); calmTimer.current = null; }
        }
        return () => { if (calmTimer.current) clearTimeout(calmTimer.current); };
    }, [volume, completed, onComplete]);

    const updateVolume = useCallback((clientY) => {
        const slider = sliderRef.current;
        if (!slider || completed) return;
        const rect = slider.getBoundingClientRect();
        const pct = Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100));
        const newVol = Math.round(pct);

        // 너무 빠르면 반발
        const now = Date.now();
        const dt = now - lastMoveTime.current;
        const diff = volumeRef.current - newVol;
        if (diff > 0 && dt < 50 && diff > 8) {
            // 반발: 볼륨 일부 되돌리기
            const bounced = Math.min(100, newVol + Math.round(diff * 0.5));
            volumeRef.current = bounced;
            setVolume(bounced);
        } else {
            volumeRef.current = newVol;
            setVolume(newVol);
        }
        lastMoveTime.current = now;
    }, [completed]);

    const handleMouseDown = (e) => { isDragging.current = true; updateVolume(e.clientY); };
    const handleMouseMove = useCallback((e) => { if (isDragging.current) updateVolume(e.clientY); }, [updateVolume]);
    const handleMouseUp = useCallback(() => { isDragging.current = false; }, []);

    const handleTouchStart = (e) => { isDragging.current = true; updateVolume(e.touches[0].clientY); };
    const handleTouchMove = useCallback((e) => { if (isDragging.current) updateVolume(e.touches[0].clientY); }, [updateVolume]);

    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('touchmove', handleTouchMove);
        window.addEventListener('touchend', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleMouseUp);
        };
    }, [handleMouseMove, handleMouseUp, handleTouchMove]);

    return (
        <div className="w-full max-w-lg mx-auto animate-fade-in">
            <p className="text-center text-white/90 text-sm mb-3 drop-shadow">
                🎧 슬라이더를 천천히 내려 파형을 안정시키세요! (너무 빠르면 튕겨요)
            </p>
            <div className="flex gap-4 items-stretch">
                {/* 파형 Canvas */}
                <canvas ref={canvasRef} width={320} height={160}
                    className="flex-1 rounded-xl bg-slate-900/80 backdrop-blur-sm border border-white/20 shadow-lg" />

                {/* 슬라이더 */}
                <div ref={sliderRef}
                    className="w-12 h-40 bg-slate-800/80 backdrop-blur-sm rounded-full border border-white/20 relative select-none shadow-lg"
                    onMouseDown={handleMouseDown}
                    onTouchStart={handleTouchStart}
                >
                    {/* 트랙 그라데이션 */}
                    <div className="absolute inset-1 rounded-full overflow-hidden">
                        <div className="w-full h-full bg-gradient-to-b from-red-500 via-amber-400 to-emerald-500 opacity-30" />
                    </div>
                    {/* 핸들 */}
                    <div className="absolute left-1/2 -translate-x-1/2 w-10 h-10 bg-white rounded-full shadow-xl border-2 border-indigo-400 flex items-center justify-center transition-[top] duration-75"
                        style={{ top: `calc(${volume}% - 20px)` }}>
                        <span className="text-lg">🎧</span>
                    </div>
                    {/* 레이블 */}
                    <div className="absolute -left-6 top-0 text-[10px] text-red-300">🔊</div>
                    <div className="absolute -left-6 bottom-0 text-[10px] text-emerald-300">🔇</div>
                </div>
            </div>
            {completed && (
                <p className="text-center text-emerald-300 font-bold mt-3 animate-fade-in drop-shadow">
                    ✅ 안정화 완료! 고요해졌어요...
                </p>
            )}
            {!completed && volume <= 30 && (
                <p className="text-center text-amber-300 text-sm mt-2 animate-pulse drop-shadow">
                    조금만 더... 천천히 내려주세요!
                </p>
            )}
        </div>
    );
}
