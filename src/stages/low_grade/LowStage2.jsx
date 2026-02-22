import { useState } from 'react';
import { useGame } from '../../GameContext';
import useTTS from '../../utils/useTTS';
import { LOW_BG_IMAGES, getLowNpcImage, ITEM_IMAGES } from '../../assetMap';

export default function LowStage2() {
    const { state, setStage, addHeart } = useGame();
    const [isComplete, setIsComplete] = useState(false);

    // TTS Text
    const text = isComplete
        ? `와! 소음이 줄어들어서 ${state.npc.name}가 편안해졌어요.`
        : `앗, 밖에서 공사 소리가 너무 크게 들려요. ${state.npc.name}가 귀를 막고 힘들어하고 있네요. 헤드폰을 눌러서 ${state.npc.name}를 도와주세요.`;

    useTTS(text, true);

    const handleTap = () => {
        if (isComplete) return;
        setIsComplete(true);
        addHeart();
    };

    const handleNext = () => {
        setStage('low_stage3');
    };

    return (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900 overflow-hidden text-center select-none">
            {/* Background */}
            <img
                src={LOW_BG_IMAGES.stages}
                alt="소음 배경"
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${isComplete ? 'opacity-20 sepia' : 'opacity-80 animate-pulse'}`}
            />
            <div className={`absolute inset-0 transition-colors duration-1000 ${isComplete ? 'bg-green-100/50' : 'bg-red-900/40'}`} />

            <div className="relative z-10 w-full h-full flex flex-col items-center justify-between p-8">

                {/* Instruction */}
                <div className={`bg-white/95 backdrop-blur-md px-8 py-5 rounded-3xl shadow-2xl border-4 max-w-3xl min-h-[100px] flex items-center justify-center transition-colors duration-500 mt-4 ${isComplete ? 'border-green-400' : 'border-red-400'}`}>
                    <h2 className={`text-2xl md:text-3xl font-bold break-keep ${isComplete ? 'text-green-700' : 'text-red-700'}`}>
                        {isComplete ? "헤드폰을 씌워주었어요!" : `${state.npc.name}가 시끄러운 소리 때문에 힘들어해요!`}
                    </h2>
                </div>

                {/* Center Visuals */}
                <div className="flex-1 w-full flex items-center justify-center gap-12 sm:gap-24 relative pb-10">

                    {/* Consistent Character Container */}
                    <div className="h-[55vh] flex flex-col justify-end items-center relative">
                        <img
                            src={getLowNpcImage(state.npc.gender, isComplete ? 'happy' : 'earblock')}
                            alt={state.npc.name}
                            className={`h-full object-contain transition-transform duration-300 ${!isComplete && 'animate-[wiggle_0.5s_ease-in-out_infinite]'}`}
                        />
                        {/* Fake Headphone Overlay */}
                        {isComplete && (
                            <img src={ITEM_IMAGES.headset} alt="장착된 헤드폰" className="absolute top-[20%] right-[-20px] w-32 h-32 object-contain animate-bounce z-20" />
                        )}
                    </div>

                    {/* Interactive Item */}
                    {!isComplete && (
                        <div
                            onClick={handleTap}
                            className="bg-white/80 p-8 rounded-full shadow-[0_0_30px_rgba(239,68,68,0.6)] cursor-pointer hover:bg-white hover:scale-110 active:scale-95 transition-all flex flex-col items-center justify-center gap-4 border-4 border-red-300 animate-pulse z-20"
                        >
                            <img src={ITEM_IMAGES.headset} alt="헤드폰" className="w-32 h-32 object-contain drop-shadow-lg" />
                            <span className="text-xl font-bold text-slate-700 bg-white/90 px-4 py-1 rounded-full whitespace-nowrap">눌러서 씌워주기</span>
                        </div>
                    )}
                </div>

                {/* Next Button Overlay */}
                {isComplete && (
                    <div className="absolute bottom-10 right-10 z-30 animate-fade-in-up">
                        <button
                            onClick={handleNext}
                            className="bg-green-500 hover:bg-green-600 text-white rounded-full px-8 py-4 text-xl font-bold shadow-lg transition-transform transform hover:-translate-y-1 cursor-pointer"
                        >
                            다음으로 가기 ▸
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
