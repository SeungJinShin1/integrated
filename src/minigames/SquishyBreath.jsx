import { useState, useEffect, useRef } from 'react';

const TOTAL_SQUEEZES = 5;

export default function SquishyBreath({ onComplete }) {
    const [count, setCount] = useState(0);
    const [phase, setPhase] = useState('inhale'); // 'inhale' | 'exhale'
    const [scale, setScale] = useState(1);
    const [heartRate, setHeartRate] = useState(100);
    const [canClick, setCanClick] = useState(false);
    const [flash, setFlash] = useState(false);
    const animRef = useRef(null);
    const startRef = useRef(Date.now());

    // 호흡 가이드 애니메이션
    useEffect(() => {
        const animate = () => {
            const elapsed = (Date.now() - startRef.current) / 1000;
            const cycle = elapsed % 4; // 4초 주기
            if (cycle < 2) {
                // 들숨: 0→2초, 커짐
                setScale(1 + (cycle / 2) * 0.5);
                setPhase('inhale');
                setCanClick(false);
            } else {
                // 날숨: 2→4초, 작아짐
                setScale(1.5 - ((cycle - 2) / 2) * 0.5);
                setPhase('exhale');
                setCanClick(true);
            }
            animRef.current = requestAnimationFrame(animate);
        };
        animRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animRef.current);
    }, []);

    const handleSqueeze = () => {
        if (!canClick || count >= TOTAL_SQUEEZES) return;
        const next = count + 1;
        setCount(next);
        setFlash(true);
        setTimeout(() => setFlash(false), 200);
        setHeartRate(Math.max(0, 100 - (next / TOTAL_SQUEEZES) * 100));
        if (next >= TOTAL_SQUEEZES) {
            setTimeout(() => onComplete(), 600);
        }
    };

    const progress = count / TOTAL_SQUEEZES;
    const done = count >= TOTAL_SQUEEZES;

    return (
        <div className="w-full max-w-xs mx-auto animate-fade-in">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-5 shadow-2xl border border-white/30">
                <div className="text-center text-sm font-bold text-slate-700 mb-3">
                    🧸 말랑이 호흡 (Rhythmic Squeeze)
                </div>

                {/* 심박수 게이지 */}
                <div className="mb-3">
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                        <span>💓 심박수</span>
                        <span>{done ? '안정 ✅' : `${Math.round(heartRate)}%`}</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                        <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                                width: `${heartRate}%`,
                                background: heartRate > 60 ? 'linear-gradient(90deg, #f97316, #ef4444)' : heartRate > 30 ? 'linear-gradient(90deg, #eab308, #f97316)' : 'linear-gradient(90deg, #22c55e, #10b981)'
                            }}
                        />
                    </div>
                </div>

                {/* 호흡 가이드 */}
                <div className="text-center text-xs text-slate-500 mb-2">
                    {done ? '🎉 안정 완료!' : phase === 'inhale' ? '후~ (들숨)' : '하~ 누르세요! (날숨)'}
                </div>

                {/* 말랑이 */}
                <div className="flex justify-center mb-3">
                    <button
                        onClick={handleSqueeze}
                        disabled={!canClick || done}
                        className={`relative w-24 h-24 rounded-full transition-all duration-200 cursor-pointer select-none
                            ${done ? 'bg-emerald-400 shadow-lg shadow-emerald-200' : canClick ? 'bg-pink-400 hover:bg-pink-500 shadow-lg shadow-pink-200 active:scale-90' : 'bg-pink-300 opacity-70'}
                            ${flash ? 'ring-4 ring-pink-300 ring-opacity-50' : ''}
                        `}
                        style={{ transform: `scale(${done ? 1 : scale})` }}
                    >
                        <span className="text-3xl">{done ? '😊' : '🧸'}</span>
                    </button>
                </div>

                {/* 진행도 */}
                <div className="flex justify-center gap-1.5">
                    {Array.from({ length: TOTAL_SQUEEZES }).map((_, i) => (
                        <div key={i} className={`w-3 h-3 rounded-full transition-all ${i < count ? 'bg-emerald-500 scale-110' : 'bg-slate-200'}`} />
                    ))}
                </div>
                <div className="text-center text-xs text-slate-400 mt-1">{count} / {TOTAL_SQUEEZES}</div>
            </div>
        </div>
    );
}
