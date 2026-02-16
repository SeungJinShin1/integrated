import { useRef, useEffect, useState, useCallback } from 'react';

const PORTS = {
    left: [
        { id: 'l-red', color: '#ef4444', label: '빨강', x: 30, y: 50 },
        { id: 'l-blue', color: '#3b82f6', label: '파랑', x: 30, y: 130 },
    ],
    right: [
        { id: 'r-red', color: '#ef4444', label: '빨강', x: 370, y: 50 },
        { id: 'r-blue', color: '#3b82f6', label: '파랑', x: 370, y: 130 },
    ],
};

// 정답: 같은 색끼리 연결
const ANSWER = { 'l-red': 'r-red', 'l-blue': 'r-blue' };

export default function WireConnect({ onComplete }) {
    const canvasRef = useRef(null);
    const [connections, setConnections] = useState({}); // { 'l-red': 'r-red', ... }
    const [drawing, setDrawing] = useState(null); // { from: portId, mx: x, my: y }
    const [sparks, setSparks] = useState([]);
    const [bulbOn, setBulbOn] = useState(false);
    const [completed, setCompleted] = useState(false);
    const drawingRef = useRef(null);

    const allPorts = [...PORTS.left, ...PORTS.right];
    const getPort = (id) => allPorts.find(p => p.id === id);

    // Canvas 그리기
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 꼬인 전선 (배경)
        ctx.setLineDash([6, 4]);
        ctx.strokeStyle = '#475569'; ctx.lineWidth = 2;
        // X자로 꼬인 선 (힌트)
        ctx.beginPath(); ctx.moveTo(50, 50); ctx.lineTo(350, 130); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(50, 130); ctx.lineTo(350, 50); ctx.stroke();
        ctx.setLineDash([]);

        // 연결된 전선들
        Object.entries(connections).forEach(([from, to]) => {
            const fp = getPort(from), tp = getPort(to);
            if (!fp || !tp) return;
            ctx.beginPath();
            ctx.moveTo(fp.x, fp.y);
            // 곡선으로 연결
            const cpx = (fp.x + tp.x) / 2;
            ctx.quadraticCurveTo(cpx, (fp.y + tp.y) / 2 - 20, tp.x, tp.y);
            ctx.strokeStyle = fp.color; ctx.lineWidth = 4;
            ctx.shadowColor = fp.color; ctx.shadowBlur = 8;
            ctx.stroke(); ctx.shadowBlur = 0;
        });

        // 현재 드래그 중인 선
        if (drawingRef.current) {
            const fp = getPort(drawingRef.current.from);
            if (fp) {
                ctx.beginPath();
                ctx.moveTo(fp.x, fp.y);
                ctx.lineTo(drawingRef.current.mx, drawingRef.current.my);
                ctx.strokeStyle = fp.color; ctx.lineWidth = 3;
                ctx.setLineDash([4, 4]); ctx.stroke(); ctx.setLineDash([]);
            }
        }

        // 포트 그리기
        allPorts.forEach(p => {
            ctx.beginPath(); ctx.arc(p.x, p.y, 14, 0, Math.PI * 2);
            ctx.fillStyle = p.color + '33'; ctx.fill();
            ctx.strokeStyle = p.color; ctx.lineWidth = 3; ctx.stroke();
            ctx.beginPath(); ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
            ctx.fillStyle = p.color; ctx.fill();
        });

        // 스파크 파티클
        sparks.forEach(s => {
            ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(250,204,21,${s.alpha})`; ctx.fill();
        });

        // 전구
        const bx = 200, by = 170;
        ctx.font = '30px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        if (bulbOn) {
            ctx.shadowColor = '#facc15'; ctx.shadowBlur = 25;
            ctx.fillText('💡', bx, by);
            ctx.shadowBlur = 0;
        } else {
            ctx.globalAlpha = 0.3;
            ctx.fillText('🔌', bx, by);
            ctx.globalAlpha = 1;
        }
    }, [connections, drawing, sparks, bulbOn]);

    const findPort = (x, y) => allPorts.find(p => Math.hypot(p.x - x, p.y - y) < 20);

    const getCanvasPos = (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return { x: clientX - rect.left, y: clientY - rect.top };
    };

    const handleStart = (e) => {
        if (completed) return;
        const pos = getCanvasPos(e);
        const port = findPort(pos.x, pos.y);
        if (port && port.id.startsWith('l-') && !connections[port.id]) {
            drawingRef.current = { from: port.id, mx: pos.x, my: pos.y };
            setDrawing(drawingRef.current);
        }
    };

    const handleMove = useCallback((e) => {
        if (!drawingRef.current) return;
        e.preventDefault();
        const pos = getCanvasPos(e);
        drawingRef.current = { ...drawingRef.current, mx: pos.x, my: pos.y };
        setDrawing({ ...drawingRef.current });
    }, []);

    const handleEnd = useCallback((e) => {
        if (!drawingRef.current) return;
        const pos = e.changedTouches ? { x: e.changedTouches[0].clientX - canvasRef.current.getBoundingClientRect().left, y: e.changedTouches[0].clientY - canvasRef.current.getBoundingClientRect().top } : getCanvasPos(e);
        const target = findPort(pos.x, pos.y);
        const from = drawingRef.current.from;

        if (target && target.id.startsWith('r-')) {
            // 같은 색인지 확인
            if (ANSWER[from] === target.id) {
                setConnections(prev => {
                    const next = { ...prev, [from]: target.id };
                    // 스파크
                    createSparks(target.x, target.y);
                    // 모두 연결되었는지 확인
                    if (Object.keys(next).length === 2) {
                        setBulbOn(true);
                        setTimeout(() => { setCompleted(true); onComplete(); }, 1000);
                    }
                    return next;
                });
            } else {
                // 오답: 잠깐 빨간색 플래시
                createSparks(target.x, target.y, true);
            }
        }
        drawingRef.current = null;
        setDrawing(null);
    }, [connections, onComplete, completed]);

    const createSparks = (x, y, isError = false) => {
        const newSparks = Array.from({ length: 8 }, () => ({
            x: x + (Math.random() - 0.5) * 40,
            y: y + (Math.random() - 0.5) * 40,
            r: 2 + Math.random() * 4,
            alpha: 1,
        }));
        setSparks(newSparks);
        // 애니메이션 후 제거
        let frame = 0;
        const animate = () => {
            frame++;
            setSparks(prev => prev.map(s => ({ ...s, r: s.r + 0.5, alpha: Math.max(0, s.alpha - 0.05) })));
            if (frame < 20) requestAnimationFrame(animate);
            else setSparks([]);
        };
        requestAnimationFrame(animate);
    };

    return (
        <div className="flex flex-col items-center animate-fade-in">
            <p className="text-center text-white/90 text-sm mb-3 drop-shadow">
                🔌 같은 색 포트끼리 전선을 연결하세요! (왼쪽→오른쪽 드래그)
            </p>
            <canvas ref={canvasRef} width={400} height={200}
                className="rounded-xl bg-slate-800/90 backdrop-blur-sm border border-white/20 shadow-lg cursor-crosshair"
                onMouseDown={handleStart}
                onMouseMove={handleMove}
                onMouseUp={handleEnd}
                onTouchStart={handleStart}
                onTouchMove={handleMove}
                onTouchEnd={handleEnd}
            />
            <div className="flex gap-4 mt-2 text-xs text-white/60">
                <span>🔴 빨강 → 빨강</span>
                <span>🔵 파랑 → 파랑</span>
                <span>{Object.keys(connections).length}/2 연결됨</span>
            </div>
            {completed && (
                <p className="text-center text-emerald-300 font-bold mt-3 animate-fade-in drop-shadow">
                    ⚡ 전구에 불이 켜졌어요!
                </p>
            )}
        </div>
    );
}
