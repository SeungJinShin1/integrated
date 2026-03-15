import { useState } from 'react';
import { useGame } from '../../GameContext';
import useTTS from '../../utils/useTTS';
import { LOW_BG_IMAGES, getLowNpcImage, ITEM_IMAGES } from '../../assetMap';

export default function LowStage4() {
    const { state, setStage, addHeart } = useGame();
    const [phase, setPhase] = useState('card_selection');
    const [tapCount, setTapCount] = useState(0);

    const isComplete = phase === 'done';

    // Dynamic TTS Text based on phase
    const getText = () => {
        if (phase === 'card_selection') return "친구가 많이 속상해 보여요. 그림 카드를 누르면 친구가 원하는 것을 말할 수 있어요!";
        if (phase === 'squishy_tapping') return "말랑말랑한 장난감이 필요하대요! 말랑이를 3번 눌러서 친구를 달래주세요.";
        return "최고! 친구가 다시 편안해졌어요.";
    };

    useTTS(getText(), true);

    const handleCardTap = () => {
        if (phase === 'card_selection') {
            setPhase('squishy_tapping');
        }
    };

    const handleSquishyTap = () => {
        if (phase !== 'squishy_tapping') return;

        const newCount = tapCount + 1;
        setTapCount(newCount);

        if (newCount >= 3) {
            setPhase('done');
            addHeart();
        }
    };

    const handleNext = () => {
        setStage('low_ending');
    };

    return (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 overflow-hidden select-none">
            <img src={LOW_BG_IMAGES.stages} alt="교실" className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-multiply" />

            <div className="relative z-10 w-full h-full flex flex-col items-center justify-between p-3 sm:p-5 md:p-8">

                <div className="bg-white/95 backdrop-blur-md px-4 py-3 sm:px-6 sm:py-4 md:px-8 md:py-4 rounded-3xl shadow-xl border-4 min-h-[60px] sm:min-h-[80px] md:min-h-[100px] flex items-center justify-center mt-4 sm:mt-8 max-w-2xl w-full transition-colors duration-500 border-indigo-300">
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-800 break-keep text-center">
                        {phase === 'card_selection' && "그림 카드를 눌러 친구의 마음을 들어볼까요?"}
                        {phase === 'squishy_tapping' && `말랑이를 3번 눌러주세요! (${tapCount}/3)`}
                        {phase === 'done' && <span className="text-green-600">완벽해요! 친구가 기분이 좋아졌어요.</span>}
                    </h2>
                </div>

                <div className="flex-1 w-full max-w-4xl flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 md:gap-12 px-2 sm:px-4 relative pb-4 sm:pb-10">

                    {/* Interactive Area - above character on mobile */}
                    <div className="w-full sm:w-1/2 flex items-center justify-center z-20 order-first sm:order-last">
                        {/* Phase 1: Card Selection */}
                        {phase === 'card_selection' && (
                            <div
                                onClick={handleCardTap}
                                className="bg-white p-4 sm:p-6 md:p-8 rounded-[2rem] sm:rounded-[3rem] shadow-2xl border-4 border-dashed border-indigo-400 cursor-pointer hover:bg-indigo-50 hover:scale-105 transition-all text-center animate-pulse group"
                            >
                                <img src={ITEM_IMAGES.pecs} alt="그림카드" className="w-28 h-28 sm:w-36 sm:h-36 md:w-48 md:h-48 object-contain mb-3 sm:mb-4 group-hover:scale-110 transition-transform drop-shadow-md mx-auto" />
                                <span className="font-bold text-lg sm:text-xl md:text-2xl text-indigo-700 bg-white px-4 py-1 sm:px-6 sm:py-2 rounded-full shadow-sm whitespace-nowrap">
                                    그림 카드 보기
                                </span>
                            </div>
                        )}

                        {/* Phase 2: Squishy Tapping */}
                        {phase === 'squishy_tapping' && (
                            <div className="relative group p-6 sm:p-8 md:p-10 cursor-pointer" onClick={handleSquishyTap}>
                                <div className="absolute inset-0 bg-pink-300 rounded-full animate-ping opacity-50"></div>
                                <img
                                    src={ITEM_IMAGES.squishy}
                                    alt="말랑이"
                                    className="relative z-10 w-32 h-32 sm:w-44 sm:h-44 md:w-56 md:h-56 object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.3)] transition-transform duration-100 ease-in-out active:scale-90"
                                    style={{ transform: `scale(${1 + tapCount * 0.1})` }}
                                />
                                <div className="absolute -bottom-6 sm:-bottom-8 md:-bottom-10 left-1/2 -translate-x-1/2 bg-white/90 px-4 py-1 sm:px-6 sm:py-2 rounded-full font-bold text-base sm:text-lg md:text-xl text-pink-600 whitespace-nowrap shadow-md">
                                    눌러주세요! 🖐
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Consistent Character Container */}
                    <div className="h-[25vh] sm:h-[35vh] md:h-[55vh] flex flex-col justify-end items-center relative">
                        <img
                            src={getLowNpcImage(state.npc.gender, phase === 'done' ? 'happy2' : 'upset')}
                            alt={state.npc.name}
                            className={`h-full object-contain ${phase !== 'done' ? 'animate-[wiggle_1s_ease-in-out_infinite] opacity-90' : 'transition-transform hover:scale-105'}`}
                        />

                        {phase === 'done' && (
                            <div className="absolute top-[10%] right-[-10px] sm:right-[-20px] text-4xl sm:text-5xl md:text-6xl animate-bounce z-20 pointer-events-none">
                                ✨
                            </div>
                        )}
                    </div>

                </div>

                {/* Next Button - in flow, bottom center */}
                {isComplete && (
                    <div className="w-full flex justify-center pb-4 sm:pb-6 z-30 animate-fade-in-up">
                        <button
                            onClick={handleNext}
                            className="bg-green-500 hover:bg-green-600 text-white rounded-full px-6 py-3 text-lg sm:px-8 sm:py-4 sm:text-xl font-bold shadow-lg transition-transform transform hover:-translate-y-1 cursor-pointer"
                        >
                            다음으로 가기 ▸
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
}
