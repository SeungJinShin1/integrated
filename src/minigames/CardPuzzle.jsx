import { useState, useRef, useCallback } from 'react';

const CARDS = [
    { id: 'me', label: '나', emoji: '🙋' },
    { id: 'you', label: '너', emoji: '🙂' },
    { id: 'name', label: '이름', emoji: '📛' },
    { id: 'hello', label: '안녕', emoji: '👋' },
];
const ANSWER = ['me', 'name', 'hello']; // 정답 순서: 나 + 이름 + 안녕

export default function CardPuzzle({ onComplete }) {
    const [slots, setSlots] = useState([null, null, null]);
    const [bouncing, setBouncing] = useState(null);
    const [solved, setSolved] = useState(false);
    const [dragCard, setDragCard] = useState(null);
    const slotRefs = useRef([]);

    const usedCards = slots.filter(Boolean);

    const handleDragStart = (cardId) => {
        setDragCard(cardId);
    };

    const handleDropOnSlot = useCallback((slotIndex) => {
        if (!dragCard || solved) return;
        setSlots(prev => {
            const next = [...prev];
            // 같은 카드가 이미 다른 슬롯에 있으면 제거
            const existIdx = next.indexOf(dragCard);
            if (existIdx !== -1) next[existIdx] = null;
            next[slotIndex] = dragCard;
            return next;
        });
        setDragCard(null);
    }, [dragCard, solved]);

    const removeFromSlot = (slotIndex) => {
        if (solved) return;
        setSlots(prev => {
            const next = [...prev];
            next[slotIndex] = null;
            return next;
        });
    };

    const checkAnswer = () => {
        const filled = slots.every(s => s !== null);
        if (!filled) return;
        const correct = slots.every((s, i) => s === ANSWER[i]);
        if (correct) {
            setSolved(true);
            setTimeout(() => onComplete(), 800);
        } else {
            // Bounce 효과: 틀렸으면 카드들이 튕겨나감
            setBouncing(true);
            setTimeout(() => {
                setSlots([null, null, null]);
                setBouncing(false);
            }, 500);
        }
    };

    const getCard = (id) => CARDS.find(c => c.id === id);

    return (
        <div className="w-full max-w-md mx-auto animate-fade-in">
            <p className="text-center text-white/90 text-sm mb-3 drop-shadow">
                💬 AAC 카드를 올바른 순서로 배치하세요!
            </p>

            {/* 카드 목록 */}
            <div className="flex justify-center gap-3 mb-5 flex-wrap">
                {CARDS.map((card, i) => {
                    const inSlot = usedCards.includes(card.id);
                    return (
                        <div
                            key={card.id}
                            draggable={!inSlot && !solved}
                            onDragStart={() => handleDragStart(card.id)}
                            onClick={() => !inSlot && !solved && setDragCard(card.id)}
                            className={`w-20 h-24 rounded-2xl flex flex-col items-center justify-center gap-1 select-none transition-all border-2
                                ${inSlot ? 'opacity-30 border-slate-400 bg-slate-600/50' : 'cursor-grab active:cursor-grabbing border-white/50 bg-white/90 hover:scale-110 hover:shadow-xl shadow-lg'}
                                ${!inSlot && !solved ? 'card-float' : ''}`}
                            style={{ animationDelay: `${i * 0.4}s` }}
                        >
                            <span className="text-2xl">{card.emoji}</span>
                            <span className={`text-sm font-bold ${inSlot ? 'text-slate-400' : 'text-slate-700'}`}>{card.label}</span>
                        </div>
                    );
                })}
            </div>

            {/* 슬롯 */}
            <div className="flex items-center justify-center gap-2 mb-4">
                {slots.map((slotCard, i) => (
                    <div key={i} className="flex items-center">
                        <div
                            ref={el => slotRefs.current[i] = el}
                            onDragOver={e => e.preventDefault()}
                            onDrop={() => handleDropOnSlot(i)}
                            onClick={() => {
                                if (slotCard) { removeFromSlot(i); }
                                else if (dragCard) { handleDropOnSlot(i); setDragCard(null); }
                            }}
                            className={`w-20 h-24 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-1 transition-all
                                ${slotCard ? (bouncing ? 'bounce-out border-red-400 bg-red-100/90' : (solved ? 'border-emerald-400 bg-emerald-100/90 scale-105' : 'border-indigo-400 bg-white/90'))
                                    : 'border-white/50 bg-white/20 slot-glow hover:bg-white/30'}`}
                        >
                            {slotCard ? (
                                <>
                                    <span className="text-2xl">{getCard(slotCard)?.emoji}</span>
                                    <span className="text-sm font-bold text-slate-700">{getCard(slotCard)?.label}</span>
                                </>
                            ) : (
                                <span className="text-2xl text-white/40">?</span>
                            )}
                        </div>
                        {i < 2 && <span className="text-xl text-white/70 mx-1 font-bold">+</span>}
                    </div>
                ))}
            </div>

            {/* 정답 제시 & 결과 */}
            {!solved && slots.every(s => s !== null) && (
                <div className="text-center">
                    <button onClick={checkAnswer}
                        className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all cursor-pointer">
                        ✅ 문장 완성!
                    </button>
                </div>
            )}
            {solved && (
                <div className="text-center animate-fade-in">
                    <p className="text-lg font-bold text-emerald-300 drop-shadow">🎉 "나, 이름, 안녕!" — 문장 완성!</p>
                </div>
            )}
        </div>
    );
}
