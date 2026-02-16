import { useRef, useEffect, useState, useCallback } from 'react';

export default function ScratchFog({ bgImage, onComplete }) {
    const canvasRef = useRef(null);
    const [cleared, setCleared] = useState(0); // 0~100%
    const [ribbonFound, setRibbonFound] = useState(false);
    const [completed, setCompleted] = useState(false);
    const isDragging = useRef(false);
    const ribbonPos = useRef({ x: 0, y: 0 });

    // 안개 레이어 초기화
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const w = canvas.width = canvas.offsetWidth;
        const h = canvas.height = canvas.offsetHeight;

        // 안개 레이어 그리기
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(0, 0, w, h);

        // 소용돌이 패턴 추가
        for (let i = 0; i < 30; i++) {
            const x = Math.random() * w, y = Math.random() * h;
            const r = 20 + Math.random() * 60;
            const grd = ctx.createRadialGradient(x, y, 0, x, y, r);
            grd.addColorStop(0, 'rgba(148,163,184,0.8)');
            grd.addColorStop(1, 'rgba(100,116,139,0.2)');
            ctx.fillStyle = grd;
            ctx.fillRect(x - r, y - r, r * 2, r * 2);
        }

        // 텍스트 힌트
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.font = 'bold 16px Noto Sans KR';
        ctx.textAlign = 'center';
        ctx.fillText('🖐️ 드래그하여 안개를 지우세요', w / 2, h / 2);

        // 리본 위치 (랜덤하되 가장자리 제외)
        ribbonPos.current = {
            x: 80 + Math.random() * (w - 160),
            y: 80 + Math.random() * (h - 160),
        };
    }, []);

    const checkRibbonHit = (x, y) => {
        const rp = ribbonPos.current;
        return Math.abs(x - rp.x) < 30 && Math.abs(y - rp.y) < 30;
    };

    const erase = useCallback((clientX, clientY) => {
        const canvas = canvasRef.current;
        if (!canvas || completed) return;
        const rect = canvas.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        const ctx = canvas.getContext('2d');

        // destination-out으로 지우기
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(x, y, 28, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalCompositeOperation = 'source-over';

        // 제거 비율 계산 (샘플링)
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        let transparent = 0;
        for (let i = 3; i < imgData.data.length; i += 16 * 4) {
            if (imgData.data[i] < 10) transparent++;
        }
        const total = Math.ceil(imgData.data.length / (16 * 4));
        const pct = Math.round((transparent / total) * 100);
        setCleared(pct);
    }, [completed]);

    const handleClick = (e) => {
        if (completed) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        // 60% 이상 지워졌고, 리본 영역 클릭 시 완료
        if (cleared >= 50 && checkRibbonHit(x, y)) {
            setRibbonFound(true);
            setCompleted(true);
            setTimeout(() => onComplete(), 800);
        }
    };

    const handleMouseDown = (e) => { isDragging.current = true; erase(e.clientX, e.clientY); };
    const handleMouseMove = useCallback((e) => { if (isDragging.current) erase(e.clientX, e.clientY); }, [erase]);
    const handleMouseUp = () => { isDragging.current = false; };
    const handleTouchStart = (e) => { isDragging.current = true; erase(e.touches[0].clientX, e.touches[0].clientY); };
    const handleTouchMove = useCallback((e) => { if (isDragging.current) erase(e.touches[0].clientX, e.touches[0].clientY); }, [erase]);

    useEffect(() => {
        window.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('touchend', handleMouseUp);
        return () => {
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchend', handleMouseUp);
        };
    }, []);

    return (
        <div className="relative w-full max-w-2xl mx-auto animate-fade-in" style={{ aspectRatio: '16/9' }}>
            {/* 배경 이미지 */}
            <img src={bgImage} alt="지도" className="absolute inset-0 w-full h-full object-cover rounded-2xl" />

            {/* 숨겨진 리본 (배경 위, 캔버스 아래) */}
            <div className="absolute z-10 pointer-events-none"
                style={{ left: ribbonPos.current.x - 16, top: ribbonPos.current.y - 16 }}>
                <span className={`text-4xl ${ribbonFound ? '' : ''}`}
                    style={ribbonFound ? { filter: 'drop-shadow(0 0 15px #facc15)' } : {}}>
                    🎗️
                </span>
            </div>

            {/* 안개 Canvas — 클릭도 여기서 처리 */}
            <canvas ref={canvasRef}
                className="absolute inset-0 w-full h-full rounded-2xl cursor-eraser z-20"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onClick={handleClick}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
            />

            {/* UI 오버레이 */}
            <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center z-30 pointer-events-none">
                <span className="text-xs text-white bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full">
                    🧹 {cleared}% 제거
                </span>
                {cleared >= 50 && !ribbonFound && (
                    <span className="text-xs text-amber-300 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full animate-pulse">
                        🎗️ 노란 리본을 찾아 클릭하세요!
                    </span>
                )}
            </div>
            {completed && (
                <div className="absolute inset-0 flex items-center justify-center z-30 bg-black/30 rounded-2xl">
                    <p className="text-2xl font-bold text-amber-300 drop-shadow-lg animate-fade-in">
                        🎗️ 노란 리본 발견!
                    </p>
                </div>
            )}
        </div>
    );
}
