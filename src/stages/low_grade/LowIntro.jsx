import { useState } from 'react';
import { useGame } from '../../GameContext';
import useTTS from '../../utils/useTTS';
import { FaPlay } from 'react-icons/fa6';
import { LOW_BG_IMAGES } from '../../assetMap';

export default function LowIntro() {
    const { setStage } = useGame();
    const [started, setStarted] = useState(false);

    // We only play TTS after user interaction (clicking Start) to bypass browser autoplay policies
    const introText = "안녕! 동물 숲에 온 것을 환영해. 동물들이 다르게 생겼듯이, 우리 친구들도 저마다 다른 모습을 가지고 있어. 지금부터 특별한 친구를 만나러 가볼까?";
    useTTS(started ? introText : '', started);

    const handleStart = () => {
        setStarted(true);
    };

    const handleNext = () => {
        setStage('low_stage1');
    };

    return (
        <div className="absolute inset-0 flex items-center justify-center z-10 overflow-hidden bg-green-50">
            {/* Background Image (Using classroom or dataworld if forest is unavailable, let's use classroom for now and tint it green) */}
            <img src={LOW_BG_IMAGES.intro} alt="동물 숲" className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-multiply filter sepia hue-rotate-90 saturate-150" />
            <div className="absolute inset-0 bg-white/30 backdrop-blur-sm" />

            <div className="relative z-10 bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-8 max-w-2xl w-full mx-4 border-4 border-green-200 text-center animate-fade-in">

                <div className="text-6xl mb-6 flex justify-center gap-4">
                    <span>🦁</span><span>🐰</span><span>🐻</span><span>🦊</span>
                </div>

                {!started ? (
                    <>
                        <h1 className="text-3xl font-bold text-green-800 mb-6 font-['CookieRun_Regular']">새싹 요원 출발!</h1>
                        <p className="text-lg text-slate-600 mb-8">소리를 켜고 시작 버튼을 눌러주세요.</p>
                        <button
                            onClick={handleStart}
                            className="bg-green-500 hover:bg-green-600 text-white rounded-full px-10 py-4 text-xl font-bold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 flex items-center justify-center mx-auto"
                        >
                            <FaPlay className="mr-2" /> <span>시작하기</span>
                        </button>
                    </>
                ) : (
                    <div className="animate-fade-in-up">
                        <div className="bg-green-100 rounded-2xl p-6 mb-8 border-2 border-green-300 relative">
                            <div className="absolute -top-4 -left-4 w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl shadow-md border-2 border-green-300">
                                🔊
                            </div>
                            <p className="text-2xl text-green-800 leading-relaxed font-bold">
                                "동물들이 다르듯<br />우리도 달라요"
                            </p>
                            <p className="text-slate-600 mt-4 text-lg">
                                특별한 친구를 만나러 가볼까요?
                            </p>
                        </div>
                        <button
                            onClick={handleNext}
                            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-2xl px-8 py-5 text-2xl font-bold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
                        >
                            다음으로 가기 ▸
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
