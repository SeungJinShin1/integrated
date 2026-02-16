import { useState } from 'react';

// PECS 카드: [나] + [할 수 있다]
const PECS_CARDS = [
    { id: 'i', label: '나', emoji: '🙋', color: '#6366f1' },
    { id: 'like', label: '좋다', emoji: '💖', color: '#ec4899' },
    { id: 'can', label: '할 수 있다', emoji: '💪', color: '#22c55e' },
    { id: 'want', label: '원하다', emoji: '🌟', color: '#f59e0b' },
];
const ANSWER = ['i', 'can']; // 정답: [나] + [할 수 있다]

export default function PecsCardPuzzle({ npcName, onComplete }) {
    const [slots, setSlots] = useState([null, null]);
    const [selected, setSelected] = useState(null);
    const [solved, setSolved] = useState(false);
    const [wrongFlash, setWrongFlash] = useState(false);

    const usedCards = slots.filter(Boolean);

    const handleCardTap = (cardId) => {
        if (solved || usedCards.includes(cardId)) return;
        setSelected(cardId);
    };

    const handleSlotTap = (slotIndex) => {
        if (solved) return;
        if (slots[slotIndex]) {
            setSlots(prev => { const n = [...prev]; n[slotIndex] = null; return n; });
            return;
        }
        if (!selected) return;
        setSlots(prev => {
            const n = [...prev];
            const exist = n.indexOf(selected);
            if (exist !== -1) n[exist] = null;
            n[slotIndex] = selected;
            return n;
        });
        setSelected(null);
    };

    const checkAnswer = () => {
        const correct = slots.every((s, i) => s === ANSWER[i]);
        if (correct) {
            setSolved(true);
            setTimeout(() => onComplete(), 1000);
        } else {
            setWrongFlash(true);
            setTimeout(() => {
                setSlots([null, null]);
                setWrongFlash(false);
            }, 500);
        }
    };

    const getCard = (id) => PECS_CARDS.find(c => c.id === id);

    return (
        <div className="w-full max-w-xs mx-auto animate-fade-in" style={{ touchAction: 'manipulation' }}>
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-3 shadow-2xl border border-white/30">
                <p className="text-center text-sm font-bold text-slate-700 mb-1">
                    💬 {npcName}(이)가 PECS 카드를 꺼냈어요!
                </p>
                <p className="text-xs text-slate-500 text-center mb-2">
                    카드를 선택해서 {npcName}(이)가 하고 싶은 말을 완성하세요!
                </p>

                {/* PECS 카드 목록 */}
                <div className="flex justify-center gap-2 mb-3 flex-wrap">
                    {PECS_CARDS.map((card) => {
                        const inSlot = usedCards.includes(card.id);
                        const isSelected = selected === card.id;
                        return (
                            <div key={card.id}
                                onClick={() => handleCardTap(card.id)}
                                className={`w-16 h-20 rounded-xl flex flex-col items-center justify-center gap-0.5 select-none transition-all border-2 cursor-pointer
                                    ${inSlot ? 'opacity-30 border-slate-300 bg-slate-100' :
                                        isSelected ? 'scale-110 shadow-xl ring-2 ring-offset-1' : 'shadow-md hover:scale-105'}`}
                                style={{
                                    borderColor: isSelected ? card.color : (inSlot ? '#cbd5e1' : card.color + '80'),
                                    backgroundColor: inSlot ? '#f1f5f9' : card.color + '15',
                                    ringColor: card.color,
                                }}
                            >
                                <span className="text-2xl">{card.emoji}</span>
                                <span className="text-xs font-bold text-slate-700">{card.label}</span>
                            </div>
                        );
                    })}
                </div>

                {selected && (
                    <p className="text-center text-indigo-600 text-xs mb-2 animate-pulse font-medium">
                        👆 아래 슬롯을 터치하여 배치하세요!
                    </p>
                )}

                {/* 슬롯: [___] + [___] */}
                <div className="flex items-center justify-center gap-2 mb-3">
                    {slots.map((slotCard, i) => (
                        <div key={i} className="flex items-center">
                            <div onClick={() => handleSlotTap(i)}
                                className={`w-16 h-20 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer
                                    ${slotCard
                                        ? (wrongFlash ? 'border-red-400 bg-red-50 animate-shake' : (solved ? 'border-emerald-400 bg-emerald-50 scale-105' : 'border-indigo-400 bg-indigo-50'))
                                        : (selected ? 'border-amber-400 bg-amber-50/50 animate-pulse' : 'border-slate-300 bg-slate-50')}`}
                            >
                                {slotCard ? (
                                    <>
                                        <span className="text-2xl">{getCard(slotCard)?.emoji}</span>
                                        <span className="text-xs font-bold text-slate-700">{getCard(slotCard)?.label}</span>
                                    </>
                                ) : (
                                    <span className="text-lg text-slate-300">?</span>
                                )}
                            </div>
                            {i < 1 && <span className="text-lg text-slate-400 mx-1 font-bold">+</span>}
                        </div>
                    ))}
                </div>

                {/* 문장 미리보기 */}
                {slots.every(s => s !== null) && !solved && (
                    <div className="text-center mb-2">
                        <p className="text-sm text-slate-600 mb-2">
                            "{slots.map(s => getCard(s)?.label).join(' ')}"
                        </p>
                        <button onClick={checkAnswer}
                            className="px-5 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all cursor-pointer text-sm">
                            ✅ 카드 확인!
                        </button>
                    </div>
                )}

                {/* 성공 */}
                {solved && (
                    <div className="text-center animate-fade-in">
                        <div className="text-2xl mb-1">🎉</div>
                        <p className="text-sm font-bold text-emerald-600">"나 할 수 있다!" — {npcName}(이)의 의사 표현 성공!</p>
                        <p className="text-xs text-slate-500 mt-1">{npcName}(이)가 자신감 있게 퍼즐 조각을 들었습니다!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
