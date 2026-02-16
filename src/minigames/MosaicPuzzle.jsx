import { useState, useRef, useEffect, useCallback } from 'react';

// 모자이크 조각 색상 (미세한 그라데이션 차이)
const MOSAIC_COLORS = [
    '#6366f1', '#7c7ff2', '#818cf8', '#6d70f3',
    '#5b5eef', '#7578f1', '#8b8ef9', '#6063ed',
    '#9295fa', '#5558ec', '#a5a8fb', '#4f52ea',
];

const CORRECT_COLOR = '#6d70f3';
const CORRECT_ROTATION = 180;
const SLOT_INDEX = 7; // 빈칸 위치

export default function MosaicPuzzle({ onComplete }) {
    const [rotation, setRotation] = useState(0);
    const [placed, setPlaced] = useState(false);
    const [nearSlot, setNearSlot] = useState(false);
    const [dragging, setDragging] = useState(false);
    const [pos, setPos] = useState({ x: 0, y: 0 });
    const [success, setSuccess] = useState(false);
    const [wrongFlash, setWrongFlash] = useState(false);
    const [glowColor, setGlowColor] = useState('transparent');
    const [attempts, setAttempts] = useState(0);
    const containerRef = useRef(null);
    const slotRef = useRef(null);
    const pieceRef = useRef(null);
    const dragStart = useRef({ x: 0, y: 0 });
    const posStart = useRef({ x: 0, y: 0 });

    const handleRotate = (e) => {
        e.stopPropagation();
        if (placed) return;
        const newRot = (rotation + 90) % 360;
        setRotation(newRot);
        // 실시간 피드백: 맞으면 초록 깜빡, 틀리면 빨간 깜빡
        if (newRot === CORRECT_ROTATION) {
            setGlowColor('#22c55e');
            setTimeout(() => setGlowColor('transparent'), 600);
        } else {
            setGlowColor('#ef4444');
            setTimeout(() => setGlowColor('transparent'), 400);
        }
    };

    const handlePointerDown = (e) => {
        if (placed) return;
        e.preventDefault();
        setDragging(true);
        const cx = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
        const cy = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
        dragStart.current = { x: cx, y: cy };
        posStart.current = { ...pos };
    };

    const handlePointerMove = useCallback((e) => {
        if (!dragging || placed) return;
        const cx = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
        const cy = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
        const dx = cx - dragStart.current.x;
        const dy = cy - dragStart.current.y;
        const newPos = { x: posStart.current.x + dx, y: posStart.current.y + dy };
        setPos(newPos);

        // 빈칸 근처 확인
        if (slotRef.current && pieceRef.current) {
            const slotRect = slotRef.current.getBoundingClientRect();
            const pieceRect = pieceRef.current.getBoundingClientRect();
            const slotCx = slotRect.left + slotRect.width / 2;
            const slotCy = slotRect.top + slotRect.height / 2;
            const pieceCx = pieceRect.left + pieceRect.width / 2;
            const pieceCy = pieceRect.top + pieceRect.height / 2;
            const dist = Math.sqrt((slotCx - pieceCx) ** 2 + (slotCy - pieceCy) ** 2);
            setNearSlot(dist < 50);
        }
    }, [dragging, placed]);

    const handlePointerUp = useCallback(() => {
        if (!dragging || placed) return;
        setDragging(false);
        setAttempts(prev => prev + 1);

        if (nearSlot && rotation === CORRECT_ROTATION) {
            // 성공! 착! 붙는 애니메이션
            setPlaced(true);
            setPos({ x: 0, y: 0 });
            setSuccess(true);
        } else if (nearSlot && rotation !== CORRECT_ROTATION) {
            // 빈칸 근처지만 회전이 안 맞음 — 빨간 깜빡 + 튕겨냄
            setWrongFlash(true);
            setGlowColor('#ef4444');
            setTimeout(() => {
                setWrongFlash(false);
                setGlowColor('transparent');
                setPos({ x: 30, y: 40 });
                setNearSlot(false);
            }, 500);
        }
    }, [dragging, placed, nearSlot, rotation]);

    useEffect(() => {
        if (!dragging) return;
        const onMove = (e) => handlePointerMove(e);
        const onUp = () => handlePointerUp();
        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
        window.addEventListener('touchmove', onMove, { passive: false });
        window.addEventListener('touchend', onUp);
        return () => {
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp);
            window.removeEventListener('touchmove', onMove);
            window.removeEventListener('touchend', onUp);
        };
    }, [dragging, handlePointerMove, handlePointerUp]);

    // 성공 후 자동 완료
    useEffect(() => {
        if (success) {
            const t = setTimeout(() => onComplete(), 1500);
            return () => clearTimeout(t);
        }
    }, [success, onComplete]);

    return (
        <div className="w-full max-w-xs mx-auto animate-fade-in" style={{ touchAction: 'none' }} ref={containerRef}>
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-3 shadow-2xl border border-white/30">
                <div className="text-center text-sm font-bold text-slate-700 mb-1">
                    🧩 모자이크 퍼즐
                </div>
                <p className="text-xs text-slate-500 text-center mb-2">
                    조각을 <b>탭하여 회전</b>하고, <b>드래그하여</b> 빈칸에 맞추세요!
                </p>

                {/* 힌트: 현재 회전 상태 표시 */}
                {!placed && (
                    <div className="flex justify-center gap-3 mb-2">
                        {[0, 90, 180, 270].map(deg => (
                            <div key={deg}
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all
                                    ${rotation === deg
                                        ? (deg === CORRECT_ROTATION ? 'bg-emerald-500 text-white scale-125 ring-2 ring-emerald-300' : 'bg-indigo-500 text-white scale-110')
                                        : 'bg-slate-200 text-slate-400'}`}>
                                {deg}°
                            </div>
                        ))}
                    </div>
                )}

                {/* 모자이크 그리드 */}
                <div className="relative mx-auto mb-3" style={{ width: 200, height: 150 }}>
                    <div className="grid grid-cols-4 grid-rows-3 w-full h-full rounded-xl overflow-hidden border-2 border-slate-200">
                        {MOSAIC_COLORS.map((color, i) => {
                            const isSlot = i === SLOT_INDEX;
                            return (
                                <div key={i}
                                    ref={isSlot ? slotRef : null}
                                    className={`relative transition-all duration-300 ${success && isSlot ? 'animate-pulse' : ''}`}
                                    style={{
                                        backgroundColor: isSlot ? (placed ? CORRECT_COLOR : 'transparent') : color,
                                        border: isSlot && !placed ? '2px dashed #94a3b8' : 'none',
                                        boxShadow: isSlot && nearSlot ? `0 0 15px ${rotation === CORRECT_ROTATION ? '#22c55e' : '#ef4444'}` : 'none',
                                    }}>
                                    {isSlot && !placed && (
                                        <div className={`absolute inset-0 flex items-center justify-center transition-all
                                            ${nearSlot ? 'animate-pulse' : ''}
                                            ${wrongFlash ? 'bg-red-200/60' : ''}`}>
                                            <span className={`text-lg ${nearSlot ? (rotation === CORRECT_ROTATION ? 'text-emerald-500' : 'text-red-500') : 'text-slate-400'}`}>
                                                {nearSlot ? (rotation === CORRECT_ROTATION ? '✓' : '✗') : '?'}
                                            </span>
                                        </div>
                                    )}
                                    {isSlot && placed && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-emerald-400/30 animate-ping-once">
                                            <span className="text-white text-lg">✓</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* 성공 시 빛 효과 오버레이 */}
                    {success && (
                        <div className="absolute inset-0 rounded-xl pointer-events-none animate-fade-in"
                            style={{
                                background: 'radial-gradient(circle, rgba(255,255,255,0.6) 0%, transparent 70%)',
                                animation: 'pulse 1s ease-in-out 2',
                            }} />
                    )}

                    {/* 드래그 가능한 조각 */}
                    {!placed && (
                        <div
                            ref={pieceRef}
                            onPointerDown={handlePointerDown}
                            onClick={handleRotate}
                            className={`absolute cursor-grab active:cursor-grabbing select-none
                                ${nearSlot ? (rotation === CORRECT_ROTATION ? 'ring-3 ring-emerald-400 shadow-emerald-400/50' : 'ring-3 ring-red-400 shadow-red-400/50') : ''}
                                ${wrongFlash ? 'animate-shake' : ''}`}
                            style={{
                                width: 46,
                                height: 46,
                                left: `calc(50% - 23px + ${pos.x}px)`,
                                top: `calc(100% + 10px + ${pos.y}px)`,
                                transform: `rotate(${rotation}deg)`,
                                transition: dragging ? 'none' : 'transform 0.3s ease, box-shadow 0.3s',
                                backgroundColor: CORRECT_COLOR,
                                borderRadius: 8,
                                border: `3px solid ${glowColor !== 'transparent' ? glowColor : 'rgba(255,255,255,0.5)'}`,
                                boxShadow: `0 0 ${glowColor !== 'transparent' ? '20px' : '10px'} ${glowColor !== 'transparent' ? glowColor : 'rgba(0,0,0,0.15)'}`,
                                zIndex: 20,
                            }}
                        >
                            <div className="w-full h-full flex items-center justify-center text-white/80 text-xl font-bold select-none">
                                ▲
                            </div>
                        </div>
                    )}
                </div>

                {/* 하단 안내 */}
                {!placed && (
                    <div className="text-center mt-6 pt-1">
                        <p className="text-xs text-slate-400">
                            현재 회전: <span className="font-bold">{rotation}°</span> · 탭하여 90° 회전 · {rotation === CORRECT_ROTATION ?
                                <span className="text-emerald-600 font-bold">✓ 올바른 각도!</span> :
                                <span className="text-slate-500">빈칸에 드래그!</span>
                            }
                        </p>
                        {attempts > 2 && !nearSlot && (
                            <p className="text-xs text-amber-500 mt-1 animate-pulse">
                                💡 힌트: 화살표(▲)가 아래를 가리키도록 회전해보세요!
                            </p>
                        )}
                    </div>
                )}

                {/* 성공 */}
                {success && (
                    <div className="text-center mt-2 animate-fade-in">
                        <div className="text-3xl mb-1" style={{ animation: 'pulse 0.5s ease-in-out 3' }}>✨🎉✨</div>
                        <p className="text-sm font-bold text-emerald-600">착! 완벽한 매칭!</p>
                        <p className="text-xs text-slate-500">벽화 전체에서 빛이 납니다! 함께 힘을 모아 성공!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
