import { useState, useRef, useEffect } from 'react';

// 모자이크 조각 색상 (미세한 그라데이션 차이)
const MOSAIC_COLORS = [
    '#6366f1', '#7c7ff2', '#818cf8', '#6d70f3',
    '#5b5eef', '#7578f1', '#8b8ef9', '#6063ed',
    '#9295fa', '#5558ec', '#a5a8fb', '#4f52ea',
];

// 정답 조각: 특정 색상 + 특정 회전
const CORRECT_COLOR = '#6d70f3';
const CORRECT_ROTATION = 180; // 정답 회전각

export default function MosaicPuzzle({ onComplete }) {
    const [rotation, setRotation] = useState(0);
    const [placed, setPlaced] = useState(false);
    const [showPecs, setShowPecs] = useState(true);
    const [pecsAccepted, setPecsAccepted] = useState(false);
    const [nearSlot, setNearSlot] = useState(false);
    const [dragging, setDragging] = useState(false);
    const [pos, setPos] = useState({ x: 0, y: 0 });
    const [success, setSuccess] = useState(false);
    const containerRef = useRef(null);
    const dragStart = useRef({ x: 0, y: 0 });
    const posStart = useRef({ x: 0, y: 0 });

    // 1단계: PECS 카드 승락
    if (showPecs && !pecsAccepted) {
        return (
            <div className="w-full max-w-sm mx-auto animate-fade-in">
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-5 shadow-2xl border border-white/30">
                    <div className="text-center text-sm font-bold text-slate-700 mb-3">
                        🃏 PECS 카드 확인
                    </div>
                    <div className="bg-emerald-50 border-2 border-emerald-300 rounded-xl p-4 mb-4 text-center">
                        <div className="flex justify-center gap-2 mb-2">
                            <span className="px-3 py-1.5 bg-white rounded-lg border-2 border-emerald-400 text-lg font-bold">나</span>
                            <span className="text-2xl">+</span>
                            <span className="px-3 py-1.5 bg-white rounded-lg border-2 border-emerald-400 text-lg font-bold">할 수 있어</span>
                        </div>
                        <p className="text-sm text-emerald-700">승주가 PECS 카드를 내밀었어요!</p>
                    </div>
                    <button
                        onClick={() => { setPecsAccepted(true); setShowPecs(false); }}
                        className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all cursor-pointer"
                    >
                        👍 "그래, 네가 해봐!"
                    </button>
                </div>
            </div>
        );
    }

    // 2단계: 모자이크 퍼즐
    const handleRotate = () => {
        if (placed) return;
        setRotation(prev => (prev + 90) % 360);
    };

    const handlePointerDown = (e) => {
        if (placed) return;
        setDragging(true);
        const rect = containerRef.current.getBoundingClientRect();
        dragStart.current = { x: e.clientX || e.touches?.[0]?.clientX, y: e.clientY || e.touches?.[0]?.clientY };
        posStart.current = { ...pos };
    };

    const handlePointerMove = (e) => {
        if (!dragging || placed) return;
        const cx = e.clientX || e.touches?.[0]?.clientX;
        const cy = e.clientY || e.touches?.[0]?.clientY;
        const dx = cx - dragStart.current.x;
        const dy = cy - dragStart.current.y;
        const newPos = { x: posStart.current.x + dx, y: posStart.current.y + dy };
        setPos(newPos);

        // 빈칸 근처 확인 (중앙 기준 40px 이내)
        const dist = Math.sqrt(newPos.x * newPos.x + newPos.y * newPos.y);
        setNearSlot(dist < 40);
    };

    const handlePointerUp = () => {
        if (!dragging || placed) return;
        setDragging(false);

        if (nearSlot && rotation === CORRECT_ROTATION) {
            setPlaced(true);
            setPos({ x: 0, y: 0 });
            setSuccess(true);
            setTimeout(() => onComplete(), 800);
        } else if (nearSlot && rotation !== CORRECT_ROTATION) {
            // 빈칸 근처지만 회전이 맞지 않음 - 살짝 튕겨냄
            setPos({ x: 30, y: 30 });
            setNearSlot(false);
        }
    };

    useEffect(() => {
        if (!dragging) return;
        const onMove = (e) => handlePointerMove(e);
        const onUp = () => handlePointerUp();
        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
        return () => {
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp);
        };
    }, [dragging, rotation, nearSlot, pos]);

    return (
        <div className="w-full max-w-sm mx-auto animate-fade-in" style={{ touchAction: 'none' }}>
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-5 shadow-2xl border border-white/30" ref={containerRef}>
                <div className="text-center text-sm font-bold text-slate-700 mb-2">
                    🧩 모자이크 퍼즐 (Rotate & Snap)
                </div>
                <p className="text-xs text-slate-500 text-center mb-3">
                    조각을 <b>클릭하여 회전</b>시키고, <b>드래그하여</b> 빈칸에 맞추세요!
                </p>

                {/* 모자이크 그리드 */}
                <div className="relative mx-auto mb-4" style={{ width: 240, height: 180 }}>
                    {/* 배경 모자이크 타일 */}
                    <div className="grid grid-cols-4 grid-rows-3 w-full h-full rounded-xl overflow-hidden border-2 border-slate-200">
                        {MOSAIC_COLORS.map((color, i) => {
                            const isSlot = i === 7; // 빈칸 위치 (8번째 타일)
                            return (
                                <div key={i} className="relative transition-all" style={{
                                    backgroundColor: isSlot ? 'transparent' : color,
                                    border: isSlot ? '2px dashed #94a3b8' : 'none',
                                }}>
                                    {isSlot && !placed && (
                                        <div className={`absolute inset-0 flex items-center justify-center ${nearSlot ? 'animate-pulse' : ''}`}>
                                            <span className="text-slate-400 text-lg">?</span>
                                        </div>
                                    )}
                                    {isSlot && placed && (
                                        <div className="absolute inset-0 transition-all duration-300" style={{
                                            backgroundColor: CORRECT_COLOR,
                                        }} />
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* 드래그 가능한 조각 */}
                    {!placed && (
                        <div
                            onPointerDown={handlePointerDown}
                            onClick={handleRotate}
                            className={`absolute cursor-grab active:cursor-grabbing transition-transform select-none ${nearSlot ? 'ring-2 ring-emerald-400' : ''}`}
                            style={{
                                width: 56,
                                height: 56,
                                left: `calc(50% - 28px + ${pos.x}px)`,
                                top: `calc(100% + 20px + ${pos.y}px)`,
                                transform: `rotate(${rotation}deg)`,
                                backgroundColor: CORRECT_COLOR,
                                borderRadius: 8,
                                border: '2px solid rgba(255,255,255,0.5)',
                                boxShadow: dragging ? '0 8px 20px rgba(0,0,0,0.3)' : '0 4px 10px rgba(0,0,0,0.15)',
                                zIndex: 20,
                            }}
                        >
                            {/* 방향 표시 화살표 */}
                            <div className="w-full h-full flex items-center justify-center text-white/70 text-xl font-bold select-none">
                                ▲
                            </div>
                        </div>
                    )}
                </div>

                {/* 하단 공간(조각+안내) */}
                {!placed && (
                    <div className="text-center mt-10 pt-2">
                        <p className="text-xs text-slate-400">
                            현재 회전: {rotation}° · 클릭으로 90° 회전
                        </p>
                    </div>
                )}

                {/* 성공 */}
                {success && (
                    <div className="text-center mt-2 animate-fade-in">
                        <div className="text-2xl mb-1">🎉</div>
                        <p className="text-sm font-bold text-emerald-600">완벽한 매칭!</p>
                        <p className="text-xs text-slate-500">미세한 색깔 차이를 승주가 단번에 알아챘어요!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
