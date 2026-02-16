import { useState, useEffect } from 'react';
import { useGame } from '../GameContext';
import DialogueBox from '../components/DialogueBox';
import ScratchFog from '../minigames/ScratchFog';
import { FaClockRotateLeft } from 'react-icons/fa6';
import { getNpcImage, getPlayerImage, BG_IMAGES } from '../assetMap';

export default function Stage5({ onToolUse }) {
    const { state, addStat, addInventory, useTool, logAccuracy, setStage, logWaiting } = useGame();
    const N = state.npc.name;
    const P = state.player.name;
    const [step, setStep] = useState(0);
    const [dialogue, setDialogue] = useState(null);
    const [showScratch, setShowScratch] = useState(false);
    const [showFlashback, setShowFlashback] = useState(false);
    const [grayscale, setGrayscale] = useState(false);
    const [npcState, setNpcState] = useState('normal');
    const [npcEmotion, setNpcEmotion] = useState('default');
    const [playerPose, setPlayerPose] = useState('thinking');

    useEffect(() => { addInventory('map'); addInventory('ribbon'); }, []);
    useEffect(() => { advanceStep(); }, [step]);

    const advanceStep = () => {
        switch (step) {
            /* ── Step 1: 위기 - 길을 잃다 ── */
            case 0:
                setPlayerPose('thinking');
                setDialogue({
                    speaker: P,
                    text: '"큰일 났다... 분명 아까 이쪽으로 온 것 같은데?" (왼쪽 넓은 길을 가리킴)',
                    onNext: () => setStep(1)
                });
                break;

            /* ── Step 2: 데이터 vs 감 ── */
            case 1:
                setNpcEmotion('memory');
                setDialogue({
                    speaker: N,
                    text: '(제자리에 멈춰 서서 고개를 저음) "왼쪽 아님. 리본 없음."',
                    onNext: () => setStep(2)
                });
                break;
            case 2:
                setPlayerPose('talk');
                setDialogue({
                    speaker: P,
                    text: '"여기가 더 넓잖아! 내 감을 믿어, 빨리 와!"',
                    choices: [
                        { text: '🚶 승주를 억지로 끌고 왼쪽 길로 간다 (Bad)', action: () => setStep(10) },
                        { text: `🤔 "리본? ${N}아, 아까 뭘 본 거야?" (승주를 믿는다)`, action: () => { logWaiting(); setStep(20); } },
                    ]
                });
                break;

            /* ── Bad: 왼쪽 길 (실패) ── */
            case 10:
                addStat('trust', -10);
                setNpcEmotion('anxious');
                setDialogue({
                    speaker: '시스템',
                    text: '⛔ 막다른 길... 큰 바위가 길을 막고 있습니다. 다시 돌아가야 합니다.',
                    onNext: () => setStep(11)
                });
                break;
            case 11:
                setDialogue({
                    speaker: P,
                    text: '"...미안, 내가 틀렸어. 노란 리본이 뭐라고 했지?"',
                    onNext: () => setStep(20)
                });
                break;

            /* ── Good: 경청 ── */
            case 20:
                addStat('trust', 10); addStat('understanding', 10);
                setDialogue({
                    speaker: '시스템',
                    text: `🧩 ${N}는 입구의 안내판을 사진처럼 기억하고 있습니다. ${N}의 기억을 확인해 보세요!`
                });
                break;

            /* ── Flashback 후 ── */
            case 30:
                setShowScratch(true);
                setDialogue({
                    speaker: '시스템',
                    text: '🖐️ 안개를 문질러 지우세요! 숨겨진 노란 리본을 찾아 클릭하세요!'
                });
                break;

            /* ── 성공 ── */
            case 40:
                setShowScratch(false);
                setNpcState('happy'); setNpcEmotion('happy');
                setDialogue({
                    speaker: N,
                    text: '(오른쪽 덤불 숲을 가리키며) "저기. 리본. 30미터."',
                    onNext: () => setStep(41)
                });
                break;
            case 41:
                setPlayerPose('talk');
                setDialogue({
                    speaker: P,
                    text: `"와... 진짜네? 아까 스쳐 지나간 걸 다 기억하고 있었어? ${N}아, 네가 우리 팀 내비게이션이다!"`,
                    onNext: () => setStep(42)
                });
                break;
            case 42:
                logAccuracy(); useTool('ribbon'); useTool('map');
                addStat('understanding', 20); addStat('communication', 20);
                setDialogue({
                    speaker: '시스템',
                    text: `🏅 기억의 나침반 획득! ${N}의 뛰어난 기억력이 길을 찾아주었어요!`,
                    onNext: () => setStage('stage-6')
                });
                break;
        }
    };

    const triggerFlashback = () => {
        setGrayscale(true); setShowFlashback(true);
    };
    const closeFlashback = () => {
        setGrayscale(false); setShowFlashback(false);
        setStep(30);
    };

    const handleScratchComplete = () => setStep(40);

    const npcImg = getNpcImage(state.npc.gender, npcEmotion);
    const playerImg = getPlayerImage(state.player.gender, playerPose);

    return (
        <div className="flex flex-col h-full">
            <div className={`flex-1 flex flex-col items-center justify-center relative animate-fade-in transition-all ${grayscale ? 'scene-grayscale' : ''} overflow-y-auto`}>
                <img src={BG_IMAGES.crossroads} alt="갈림길" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/30" />
                <div className="z-10 flex flex-col items-center w-full px-4">
                    <div className="stage-title font-bold text-white mb-1 drop-shadow-lg">🌲 Stage 5: 갈림길의 기억</div>
                    <div className="stage-subtitle text-white/80 mb-2 drop-shadow">통합 & 신뢰</div>
                    <div className="flex gap-2 mb-2 items-start justify-center w-full max-w-lg">
                        <div className="text-center flex-shrink-0">
                            <div className="char-card bg-white/20 backdrop-blur-sm shadow-lg border border-white/30">
                                <img src={playerImg} alt={P} className="char-img" />
                            </div>
                            <p className="text-sm mt-1 font-medium text-white drop-shadow">{P}</p>
                        </div>
                        <div className="minigame-area">
                            {showScratch && <ScratchFog bgImage={BG_IMAGES.map} onComplete={handleScratchComplete} />}
                            {step === 20 && !showFlashback && (
                                <button onClick={triggerFlashback}
                                    className="px-5 py-2.5 bg-slate-800/80 backdrop-blur-sm text-white rounded-xl font-medium hover:bg-slate-700 transition-all cursor-pointer animate-fade-in border border-white/20 text-sm">
                                    <FaClockRotateLeft className="inline mr-2" />회상 (Flashback)
                                </button>
                            )}
                        </div>
                        <div className="text-center flex-shrink-0">
                            <div className={`char-card shadow-lg border border-white/30 transition-all ${npcState === 'happy' ? 'bg-amber-500/20 backdrop-blur-sm' : 'bg-white/20 backdrop-blur-sm'}`}>
                                <img src={npcImg} alt={N} className="char-img" />
                            </div>
                            <p className="text-sm mt-1 font-medium text-white drop-shadow">{N}</p>
                        </div>
                    </div>
                </div>
                {showFlashback && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-30">
                        <div className="bg-white/95 rounded-2xl p-6 max-w-sm shadow-2xl animate-fade-in text-center">
                            <p className="text-sm text-slate-500 mb-2">💭 {N}의 기억 속 안내 표지판</p>
                            <div className="mb-3 rounded-xl overflow-hidden">
                                <img src={BG_IMAGES.map} alt="안내도" className="w-full rounded-xl" />
                            </div>
                            <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4 mb-3">
                                <p className="text-lg font-bold text-amber-800">🎗️ 노란 리본을 따라가세요</p>
                                <p className="text-sm text-amber-600 mt-1">→ 오른쪽 좁은 길로 이동</p>
                            </div>
                            <button onClick={closeFlashback}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 cursor-pointer">
                                현실로 돌아가기
                            </button>
                        </div>
                    </div>
                )}
            </div>
            {dialogue && <DialogueBox speaker={dialogue.speaker} text={dialogue.text} choices={dialogue.choices} onNext={dialogue.onNext} npcName={N} playerName={P} />}
        </div>
    );
}
