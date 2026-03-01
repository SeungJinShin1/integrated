import { useState } from 'react';
import { useGame } from '../../GameContext';
import useTTS from '../../utils/useTTS';
import { LOW_BG_IMAGES, getLowNpcImage } from '../../assetMap';
import { FaClock } from 'react-icons/fa6';

export default function LowStage3() {
    const { state, setStage, addHeart } = useGame();
    const [tapCount, setTapCount] = useState(0);

    const isComplete = tapCount >= 3;

    // TTS Text
    const text = isComplete
        ? "참 잘했어요! 기다려주니 친구가 대답을 했어요."
        : "친구의 대답이 늦어지고 있어요. 시계 버튼을 3번 눌러서 잠시 기다려줄까요?";

    useTTS(text, true);

    const handleWaitTap = () => {
        if (isComplete) return;
        const newCount = tapCount + 1;
        setTapCount(newCount);
        if (newCount === 3) {
            addHeart();
        }
    };

    const handleNext = () => {
        setStage('low_stage4');
    };

    return (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 overflow-hidden select-none">
            <img src={LOW_BG_IMAGES.stages} alt="교실" className="absolute inset-0 w-full h-full object-cover opacity-70 border-0" />

            <div className="relative z-10 w-full h-full flex flex-col items-center justify-between p-3 sm:p-5 md:p-8">

                <div className="bg-white/90 backdrop-blur-sm px-4 py-3 sm:px-6 sm:py-4 md:px-8 md:py-5 rounded-2xl shadow-lg border-2 border-indigo-200 mt-4 sm:mt-8 max-w-2xl w-full text-center min-h-[60px] sm:min-h-[80px] md:min-h-[100px] flex items-center justify-center">
                    <p className="text-lg sm:text-xl md:text-2xl font-bold text-slate-800 break-keep">
                        {isComplete ? (
                            <span className="text-green-600">성공! 친구가 대답할 시간을 주었어요.</span>
                        ) : (
                            `시계 버튼을 눌러주세요! (${tapCount}/3)`
                        )}
                    </p>
                </div>

                <div className="flex-1 w-full flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 md:gap-12 relative pb-4 sm:pb-10">

                    {/* Traffic Light Visual */}
                    <div className="bg-slate-800 p-3 sm:p-4 md:p-6 rounded-[30px] sm:rounded-[40px] md:rounded-[50px] flex flex-row sm:flex-col gap-3 sm:gap-4 md:gap-6 shadow-2xl border-4 border-slate-700 z-20">
                        <div className={`w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full shadow-[inset_0_-5px_15px_rgba(0,0,0,0.5)] transition-all duration-300 ${tapCount === 1 ? 'bg-red-500 shadow-[0_0_40px_rgba(239,68,68,1)]' : 'bg-red-900 opacity-50'}`}></div>
                        <div className={`w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full shadow-[inset_0_-5px_15px_rgba(0,0,0,0.5)] transition-all duration-300 ${tapCount === 2 ? 'bg-yellow-500 shadow-[0_0_40px_rgba(234,179,8,1)]' : 'bg-yellow-900 opacity-50'}`}></div>
                        <div className={`w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full shadow-[inset_0_-5px_15px_rgba(0,0,0,0.5)] transition-all duration-300 ${tapCount >= 3 ? 'bg-green-500 shadow-[0_0_40px_rgba(34,197,94,1)] scale-110' : 'bg-green-900 opacity-50'}`}></div>
                    </div>

                    {/* Character Container */}
                    <div className="h-[25vh] sm:h-[35vh] md:h-[55vh] flex flex-col justify-end items-center relative">
                        <img
                            src={getLowNpcImage(state.npc.gender, !isComplete ? 'default' : 'happy')}
                            alt={state.npc.name}
                            className={`h-full object-contain transition-transform duration-500 ${isComplete && 'hover:scale-105'}`}
                        />
                        {isComplete && (
                            <div className="absolute -top-2 sm:top-10 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:-left-20 bg-white p-3 sm:p-4 rounded-3xl rounded-br-sm shadow-xl font-bold text-base sm:text-lg md:text-xl text-slate-800 animate-bounce whitespace-nowrap z-30 border-2 border-indigo-200">
                                기다려줘서<br />고마워!
                            </div>
                        )}
                    </div>

                    {/* Interactive Button */}
                    {!isComplete && (
                        <div
                            onClick={handleWaitTap}
                            className="bg-white/90 p-4 sm:p-6 md:p-8 rounded-full shadow-[0_0_30px_rgba(99,102,241,0.6)] cursor-pointer hover:bg-white hover:scale-110 active:scale-95 transition-all flex flex-col items-center justify-center gap-2 sm:gap-4 border-4 border-indigo-300 animate-pulse z-20"
                        >
                            <FaClock className="text-4xl sm:text-5xl md:text-6xl text-indigo-500 mb-1 sm:mb-2 drop-shadow-md" />
                            <span className="text-base sm:text-lg md:text-xl font-bold text-slate-700 whitespace-nowrap bg-indigo-50 px-3 py-1 sm:px-4 rounded-full">기다리기</span>
                        </div>
                    )}
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
