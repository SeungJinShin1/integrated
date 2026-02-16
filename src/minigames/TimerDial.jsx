import { useRef, useEffect, useState, useCallback } from 'react';

export default function TimerDial({ onComplete }) {
    const canvasRef = useRef(null);
    const [angle, setAngle] = useState(0); // 0~300도 (5분 목표)
    const [phase, setPhase] = useState('winding'); // 'winding' | 'counting' | 'done'
    const isDragging = useRef(false);
    const lastAngle = useRef(0);
    const centerRef = useRef({ x: 0, y: 0 });

    const TARGET = 300; // 5분 = 300도

    // Canvas 그리기
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const cx = canvas.width / 2, cy = canvas.height / 2, r = 70;
        centerRef.current = { x: cx, y: cy };

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 배경 원
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fillStyle = '#1e293b'; ctx.fill();
        ctx.strokeStyle = '#475569'; ctx.lineWidth = 3; ctx.stroke();

        // 눈금
        for (let i = 0; i < 60; i++) {
            const a = (i / 60) * Math.PI * 2 - Math.PI / 2;
            const inner = i % 5 === 0 ? r - 12 : r - 6;
            ctx.beginPath();
            ctx.moveTo(cx + Math.cos(a) * inner, cy + Math.sin(a) * inner);
            ctx.lineTo(cx + Math.cos(a) * (r - 2), cy + Math.sin(a) * (r - 2));
            ctx.strokeStyle = i % 5 === 0 ? '#94a3b8' : '#475569';
            ctx.lineWidth = i % 5 === 0 ? 2 : 1;
            ctx.stroke();
        }

        // 빨간 영역 (채워진 만큼)
        if (angle > 0) {
            const startA = -Math.PI / 2;
            const endA = startA + (angle / 360) * Math.PI * 2;
            ctx.beginPath(); ctx.moveTo(cx, cy);
            ctx.arc(cx, cy, r - 2, startA, endA);
            ctx.closePath();
            ctx.fillStyle = phase === 'done' ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.35)';
            ctx.fill();
        }

        // 중앙
        ctx.beginPath(); ctx.arc(cx, cy, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#e2e8f0'; ctx.fill();

        // 현재 각도에 바늘
        const needleA = -Math.PI / 2 + (angle / 360) * Math.PI * 2;
        ctx.beginPath(); ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(needleA) * (r - 15), cy + Math.sin(needleA) * (r - 15));
        ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.stroke();

        // 텍스트
        ctx.fillStyle = '#fff'; ctx.font = 'bold 20px Noto Sans KR'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        if (phase === 'done') {
            ctx.fillText('✓', cx, cy);
        } else {
            const mins = Math.round(angle / 60);
            ctx.fillText(`${mins}분`, cx, cy + 28);
        }

        // 핸들 (드래그용)
        if (phase === 'winding') {
            const handleA = -Math.PI / 2 + (angle / 360) * Math.PI * 2;
            const hx = cx + Math.cos(handleA) * (r + 16);
            const hy = cy + Math.sin(handleA) * (r + 16);
            ctx.beginPath(); ctx.arc(hx, hy, 12, 0, Math.PI * 2);
            ctx.fillStyle = '#f59e0b'; ctx.fill();
            ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
            ctx.fillStyle = '#fff'; ctx.font = 'bold 12px sans-serif';
            ctx.fillText('⟳', hx, hy + 1);
        }
    }, [angle, phase]);

    const getAngleFromEvent = useCallback((clientX, clientY) => {
        const canvas = canvasRef.current;
        if (!canvas) return 0;
        const rect = canvas.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        let a = Math.atan2(clientY - cy, clientX - cx) * (180 / Math.PI) + 90;
        if (a < 0) a += 360;
        return a;
    }, []);

    const handleStart = (clientX, clientY) => {
        if (phase !== 'winding') return;
        isDragging.current = true;
        lastAngle.current = getAngleFromEvent(clientX, clientY);
    };

    const handleMove = useCallback((clientX, clientY) => {
        if (!isDragging.current || phase !== 'winding') return;
        const newA = getAngleFromEvent(clientX, clientY);
        let delta = newA - lastAngle.current;
        // 시계 방향만 허용
        if (delta < -180) delta += 360;
        if (delta > 180) delta -= 360;
        if (delta > 0) {
            setAngle(prev => Math.min(TARGET, prev + delta));
        }
        lastAngle.current = newA;
    }, [phase, getAngleFromEvent]);

    const handleEnd = useCallback(() => {
        isDragging.current = false;
        if (phase === 'winding' && angle >= TARGET - 10) {
            setAngle(TARGET);
            setPhase('counting');
        }
    }, [phase, angle]);

    // 카운트다운
    useEffect(() => {
        if (phase !== 'counting') return;
        const interval = setInterval(() => {
            setAngle(prev => {
                const next = prev - 2;
                if (next <= 0) {
                    clearInterval(interval);
                    setPhase('done');
                    setTimeout(() => onComplete(), 600);
                    return 0;
                }
                return next;
            });
        }, 30);
        return () => clearInterval(interval);
    }, [phase, onComplete]);

    // Global mouse/touch events
    useEffect(() => {
        const mm = (e) => handleMove(e.clientX, e.clientY);
        const tm = (e) => handleMove(e.touches[0].clientX, e.touches[0].clientY);
        const up = () => handleEnd();
        window.addEventListener('mousemove', mm);
        window.addEventListener('mouseup', up);
        window.addEventListener('touchmove', tm);
        window.addEventListener('touchend', up);
        return () => {
            window.removeEventListener('mousemove', mm);
            window.removeEventListener('mouseup', up);
            window.removeEventListener('touchmove', tm);
            window.removeEventListener('touchend', up);
        };
    }, [handleMove, handleEnd]);

    return (
        <div className="flex flex-col items-center animate-fade-in">
            <p className="text-center text-white/90 text-sm mb-3 drop-shadow">
                ⏰ 다이얼을 시계 방향으로 돌려 5분을 맞추세요!
            </p>
            <canvas ref={canvasRef} width={200} height={200}
                className="rounded-full shadow-2xl cursor-grab active:cursor-grabbing"
                onMouseDown={e => handleStart(e.clientX, e.clientY)}
                onTouchStart={e => handleStart(e.touches[0].clientX, e.touches[0].clientY)}
            />
            {phase === 'winding' && (
                <p className="text-amber-300 text-sm mt-3 drop-shadow">
                    🔄 {Math.round(angle / 60)}/5분 — {angle >= TARGET - 10 ? '손을 놓으세요!' : '시계 방향으로 돌리세요'}
                </p>
            )}
            {phase === 'counting' && (
                <p className="text-red-300 text-sm mt-3 animate-pulse drop-shadow">
                    ⏳ 타이머 작동 중... {Math.ceil(angle / 60)}분 남음
                </p>
            )}
            {phase === 'done' && (
                <p className="text-emerald-300 font-bold mt-3 animate-fade-in drop-shadow">
                    🎉 띠링! 타이머 완료!
                </p>
            )}
        </div>
    );
}
