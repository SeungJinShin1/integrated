import { useState } from 'react';

const CARDS = [
    { id: 'me', label: '나', emoji: '🙋' },
    { id: 'you', label: '너', emoji: '🙂' },
    { id: 'name', label: '이름', emoji: '📛' },
    { id: 'hello', label: '안녕', emoji: '👋' },
];
const ANSWER = ['me', 'name', 'hello']; // 정답 순서: 나 + 이름 + 안녕

export default function CardPuzzle({ onComplete }) {
    const [slots, setSlots] = useState([null, null, null]);
    const [bouncing, setBouncing] = useState(false);
    const [solved, setSolved] = useState(false);
    const [selectedCard, setSelectedCard] = useState(null);

    const usedCards = slots.filter(Boolean);

    // 카드 선택 (터치/클릭 모두)
    const handleCardTap = (cardId) => {
        if (solved) return;
        const inSlot = usedCards.includes(cardId);
        if (inSlot) return;
        setSelectedCard(cardId);
    };

    // 슬롯 탭 → 선택된 카드를 배치
    const handleSlotTap = (slotIndex) => {
        if (solved) return;
        if (slots[slotIndex]) {
            // 이미 카드가 있으면 제거
            setSlots(prev => {
                const next = [...prev];
                next[slotIndex] = null;
                return next;
            });
            return;
        }
        if (!selectedCard) return;
        setSlots(prev => {
            const next = [...prev];
            // 같은 카드가 다른 슬롯에 있으면 제거
            const existIdx = next.indexOf(selectedCard);
            if (existIdx !== -1) next[existIdx] = null;
            next[slotIndex] = selectedCard;
            return next;
        });
        setSelectedCard(null);
    };

    const checkAnswer = () => {
        const filled = slots.every(s => s !== null);
        if (!filled) return;
        const correct = slots.every((s, i) => s === ANSWER[i]);
        if (correct) {
            setSolved(true);
            setTimeout(() => onComplete(), 800);
        } else {
            setBouncing(true);
            setTimeout(() => {
                setSlots([null, null, null]);
                setBouncing(false);
            }, 500);
        }
    };

    const getCard = (id) => CARDS.find(c => c.id === id);

    return (
        <div className="w-full max-w-xs mx-auto animate-fade-in" style={{ touchAction: 'manipulation' }}>
            <p className="text-center text-white/90 text-sm mb-2 drop-shadow">
                💬 카드를 터치하고 슬롯에 배치하세요!
            </p>

            {/* 카드 목록 */}
            <div className="flex justify-center gap-2 mb-3 flex-wrap">
                {CARDS.map((card) => {
                    const inSlot = usedCards.includes(card.id);
                    const isSelected = selectedCard === card.id;
                    return (
                        <div
                            key={card.id}
                            onClick={() => handleCardTap(card.id)}
                            className={`w-16 h-20 rounded-xl flex flex-col items-center justify-center gap-0.5 select-none transition-all border-2
                                ${inSlot ? 'opacity-30 border-slate-400 bg-slate-600/50' :
                                    isSelected ? 'border-amber-400 bg-amber-50/95 scale-110 shadow-xl ring-2 ring-amber-300' :
                                        'border-white/50 bg-white/90 hover:scale-105 shadow-lg cursor-pointer'}`}
                        >
                            <span className="text-xl">{card.emoji}</span>
                            <span className={`text-xs font-bold ${inSlot ? 'text-slate-400' : 'text-slate-700'}`}>{card.label}</span>
                        </div>
                    );
                })}
            </div>

            {selectedCard && (
                <p className="text-center text-amber-300 text-xs mb-2 animate-pulse drop-shadow">
                    👆 아래 슬롯을 터치하여 "{getCard(selectedCard)?.label}" 카드를 배치하세요!
                </p>
            )}

            {/* 슬롯 */}
            <div className="flex items-center justify-center gap-1.5 mb-3">
                {slots.map((slotCard, i) => (
                    <div key={i} className="flex items-center">
                        <div
                            onClick={() => handleSlotTap(i)}
                            className={`w-16 h-20 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer
                                ${slotCard ? (bouncing ? 'bounce-out border-red-400 bg-red-100/90' : (solved ? 'border-emerald-400 bg-emerald-100/90 scale-105' : 'border-indigo-400 bg-white/90'))
                                    : (selectedCard ? 'border-amber-400 bg-amber-50/40 animate-pulse' : 'border-white/50 bg-white/20 slot-glow')}`}
                        >
                            {slotCard ? (
                                <>
                                    <span className="text-xl">{getCard(slotCard)?.emoji}</span>
                                    <span className="text-xs font-bold text-slate-700">{getCard(slotCard)?.label}</span>
                                </>
                            ) : (
                                <span className="text-xl text-white/40">?</span>
                            )}
                        </div>
                        {i < 2 && <span className="text-lg text-white/70 mx-0.5 font-bold">+</span>}
                    </div>
                ))}
            </div>

            {/* 정답 제시 & 결과 */}
            {!solved && slots.every(s => s !== null) && (
                <div className="text-center">
                    <button onClick={checkAnswer}
                        className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all cursor-pointer text-sm">
                        ✅ 문장 완성!
                    </button>
                </div>
            )}
            {solved && (
                <div className="text-center animate-fade-in">
                    <p className="text-base font-bold text-emerald-300 drop-shadow">🎉 "나, 이름, 안녕!" — 문장 완성!</p>
                </div>
            )}
        </div>
    );
}
