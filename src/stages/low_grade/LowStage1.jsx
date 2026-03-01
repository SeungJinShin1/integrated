import { useState } from 'react';
import { useGame } from '../../GameContext';
import useTTS from '../../utils/useTTS';
import { LOW_BG_IMAGES, getLowNpcImage } from '../../assetMap';

export default function LowStage1() {
    const { state, setStage, addHeart } = useGame();
    const [isComplete, setIsComplete] = useState(false);

    // TTS Text
    const text = isComplete
        ? "잘했어! 친구도 기뻐하는 것 같네."
        : `${state.npc.name}가 혼자 클레이 놀이를 하고 있어요. 다가가서 먼저 인사를 건네볼까요? '같이 놀자' 말풍선을 눌러주세요.`;

    useTTS(text, true);

    const handleTap = () => {
        if (isComplete) return;
        setIsComplete(true);
        addHeart();
    };

    const handleNext = () => {
        setStage('low_stage2');
    };

    return (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 overflow-hidden">
            {/* Background */}
            <img src={LOW_BG_IMAGES.stages} alt="미술실" className="absolute inset-0 w-full h-full object-cover opacity-80" />

            {/* Main Interactive Area */}
            <div className="relative z-10 w-full h-full flex flex-col items-center justify-between p-3 sm:p-5 md:p-8">

                {/* Instruction Text Box */}
                <div className="bg-white/90 backdrop-blur-sm px-4 py-3 sm:px-6 sm:py-4 rounded-2xl shadow-lg border-2 border-indigo-200 mt-4 sm:mt-8 max-w-2xl w-full text-center min-h-[60px] sm:min-h-[80px] md:min-h-[100px] flex items-center justify-center">
                    <p className="text-lg sm:text-xl md:text-2xl font-bold text-slate-800 break-keep">
                        {isComplete ? (
                            <span className="text-green-600">성공! 친구와 함께 놀게 되었어요.</span>
                        ) : (
                            "친구에게 먼저 다가가 볼까요?"
                        )}
                    </p>
                </div>

                {/* Character and Interaction */}
                <div className="flex-1 w-full flex flex-col items-center justify-end relative pb-4 sm:pb-10">

                    {/* Speech Bubble to Tap - above character on mobile */}
                    {!isComplete && (
                        <div
                            onClick={handleTap}
                            className="p-4 sm:p-6 bg-white rounded-[2rem] rounded-bl-sm shadow-xl border-4 border-indigo-400 cursor-pointer hover:bg-indigo-50 hover:scale-110 active:scale-95 transition-all text-center animate-bounce z-20 mb-3 sm:mb-4"
                        >
                            <span className="text-xl sm:text-2xl md:text-3xl font-bold text-indigo-700 whitespace-nowrap">같이 놀자! 👋</span>
                        </div>
                    )}

                    {/* Consistent Character Container */}
                    <div className="h-[30vh] sm:h-[40vh] md:h-[55vh] flex flex-col justify-end items-center relative">
                        <img
                            src={getLowNpcImage(state.npc.gender, isComplete ? 'happy' : 'default')}
                            alt={state.npc.name}
                            className={`h-full object-contain transition-transform duration-500 ${!isComplete && 'hover:scale-105'}`}
                        />

                        {/* Success Effect */}
                        {isComplete && (
                            <div className="absolute top-1/4 -right-4 sm:right-[-40px] animate-ping z-20 pointer-events-none">
                                <span className="text-4xl sm:text-6xl">💖</span>
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
