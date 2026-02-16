import { useState, useEffect } from 'react';
import { useGame } from '../GameContext';
import DialogueBox from '../components/DialogueBox';
import CardPuzzle from '../minigames/CardPuzzle';
import { getNpcImage, getPlayerImage, BG_IMAGES } from '../assetMap';

export default function Stage1({ onToolUse }) {
    const { state, addStat, addInventory, useTool, logAccuracy, setStress, setStage } = useGame();
    const N = state.npc.name;
    const P = state.player.name;
    const [step, setStep] = useState(0);
    const [dialogue, setDialogue] = useState(null);
    const [showPuzzle, setShowPuzzle] = useState(false);
    const [npcState, setNpcState] = useState('rocking'); // 상동행동
    const [showStress, setShowStress] = useState(false);
    const [vignetteRed, setVignetteRed] = useState(false);
    const [npcEmotion, setNpcEmotion] = useState('default');
    const [playerPose, setPlayerPose] = useState('talk');

    useEffect(() => { addInventory('aac'); }, []);
    useEffect(() => { advanceStep(); }, [step]);

    const advanceStep = () => {
        switch (step) {
            /* ── Step 1: 관찰 - 첫 만남 ── */
            case 0:
                setPlayerPose('thinking');
                setDialogue({
                    speaker: P,
                    text: `(${N}(이)가 자리에서 몸을 앞뒤로 흔들며 허공을 보고 있다. 새 짝꿍이라 말을 걸어보고 싶다. 어떻게 할까?)`,
                    choices: [
                        { text: '👋 어깨를 툭 치며 부른다 (접촉)', action: () => { addStat('trust', -5); setStep(1); } },
                        { text: '✋ 앞에 가서 손을 흔든다 (시각)', action: () => { setStep(1); } },
                        { text: '🪑 조용히 옆에 앉아 기다린다 (관찰)', action: () => { addStat('patience', 10); setStep(1); } },
                    ]
                });
                break;

            /* ── Step 2: 반향어 발생 ── */
            case 1:
                setPlayerPose('talk');
                setDialogue({ speaker: P, text: '"안녕? 너 이름이 뭐야?"', onNext: () => setStep(2) });
                break;
            case 2:
                setNpcState('shaking'); setNpcEmotion('anxious');
                setDialogue({ speaker: N, text: '(눈을 마주치지 않고) "이름이 뭐야. 이름이 뭐야."', onNext: () => setStep(3) });
                break;

            /* ── Step 3: 갈등 - 잘못된 접근 ── */
            case 3:
                setPlayerPose('surprised');
                setDialogue({
                    speaker: P,
                    text: '(뭐야, 왜 내 말을 따라 해? 장난치는 건가?)',
                    choices: [
                        { text: '😡 "야! 너 왜 자꾸 나 따라 해? 장난치지 마!"', action: () => setStep(10) },
                        { text: '📢 "이! 름! 이! 뭐! 냐! 고!"', action: () => setStep(20) },
                        { text: '😐 (당황스럽지만 일단 가만히 있는다)', action: () => setStep(30) },
                    ]
                });
                break;

            /* ── Step 4-A: Bad - 비난 ── */
            case 10:
                setVignetteRed(true); setShowStress(true); setStress(40);
                setNpcState('stressed'); setNpcEmotion('pain');
                addStat('trust', -10);
                setDialogue({ speaker: N, text: '"장난치지 마! 하지 마! 하지 마!" (목소리 톤이 높아짐)', onNext: () => setStep(40) });
                break;

            /* ── Step 4-B: Bad - 큰 소리 ── */
            case 20:
                setVignetteRed(true); setShowStress(true); setStress(60);
                setNpcState('stressed'); setNpcEmotion('pain');
                addStat('trust', -20);
                setDialogue({ speaker: N, text: '(비명) "아악! 삐-- 소리! 삐-- 소리!"', onNext: () => setStep(21) });
                break;
            case 21:
                setDialogue({
                    speaker: '시스템',
                    text: `⚠️ 감각 경보! ${N}는 청각이 매우 예민합니다. 큰 소리는 고통을 줍니다.`,
                    onNext: () => setStep(40)
                });
                break;

            /* ── Step 4-C: Good - 기다림 ── */
            case 30:
                addStat('patience', 10);
                setNpcEmotion('calm');
                setDialogue({ speaker: N, text: '(작은 목소리로) "이름이 뭐야... 이름이 뭐야..."', onNext: () => setStep(31) });
                break;
            case 31:
                setDialogue({
                    speaker: '시스템',
                    text: '💡 말로 하는 대화가 어려운 상태입니다. [도구]가 필요합니다.',
                    onNext: () => setStep(40)
                });
                break;

            /* ── Step 5: 미니게임 ── */
            case 40:
                setDialogue({
                    speaker: '시스템',
                    text: `🧩 [AAC 태블릿]을 활성화합니다. 흩어진 단어 카드를 조합해 ${N}에게 건네세요!`
                });
                setShowPuzzle(true);
                break;

            /* ── 성공 후 ── */
            case 50:
                setShowPuzzle(false); setVignetteRed(false);
                setNpcState('calm'); setNpcEmotion('calm');
                setDialogue({
                    speaker: N,
                    text: `(태블릿을 보며 비로소 눈을 맞춤) "...${N}. 안녕."`,
                    onNext: () => setStep(51)
                });
                break;
            case 51:
                setNpcEmotion('happy');
                setDialogue({
                    speaker: '시스템',
                    text: `🏅 소통의 배지 획득! 반향어는 나쁜 행동이 아니라, 따라 하면서 배우는 ${N}만의 소통 방식이었어요.`,
                    onNext: () => setStage('stage-2')
                });
                break;
        }
    };

    const handlePuzzleComplete = () => {
        logAccuracy(); useTool('aac');
        addStat('communication', 20); addStat('trust', 10);
        setStep(50);
    };

    useEffect(() => {
        if (!onToolUse) return;
        onToolUse.current = (id) => { if (id === 'aac' && step === 40) handlePuzzleComplete(); };
    }, [step]);

    const npcImg = getNpcImage(state.npc.gender, npcEmotion);
    const playerImg = getPlayerImage(state.player.gender, playerPose);

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 flex flex-col items-center justify-center relative animate-fade-in overflow-hidden">
                <img src={BG_IMAGES.breaktime} alt="쉬는 시간 교실" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/30" />
                {vignetteRed && <div className="absolute inset-0 vignette-red pointer-events-none z-20 animate-pulse" />}
                <div className="z-10 flex flex-col items-center w-full px-4">
                    <div className="text-xl font-bold text-white mb-1 drop-shadow-lg">🦜 Stage 1: 앵무새의 숲</div>
                    <div className="text-sm text-white/80 mb-4 drop-shadow">반향어 & 소통</div>
                    <div className="flex gap-6 mb-4 items-end">
                        <div className="text-center">
                            <div className="w-44 h-56 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg overflow-hidden border border-white/30">
                                <img src={playerImg} alt={P} className="char-img" />
                            </div>
                            <p className="text-sm mt-2 font-medium text-white drop-shadow">{P}</p>
                        </div>
                        <div className="text-center">
                            <div className={`w-44 h-56 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden border border-white/30 transition-all ${npcState === 'stressed' ? 'animate-shake bg-red-500/30 backdrop-blur-sm' :
                                npcState === 'rocking' ? 'animate-pulse bg-amber-500/10 backdrop-blur-sm' :
                                    npcState === 'calm' ? 'bg-emerald-500/20 backdrop-blur-sm' :
                                        'bg-white/20 backdrop-blur-sm'}`}>
                                <img src={npcImg} alt={N} className="char-img" />
                            </div>
                            <p className="text-sm mt-2 font-medium text-white drop-shadow">{N}</p>
                        </div>
                    </div>
                    {showStress && (
                        <div className="w-64 mb-4 animate-fade-in">
                            <div className="text-xs text-red-300 mb-1 font-medium drop-shadow">😤 {N}의 불안도</div>
                            <div className="h-2 rounded-full bg-white/30 overflow-hidden">
                                <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-red-500 transition-all duration-500" style={{ width: `${Math.min(100, state.stressGauge)}%` }} />
                            </div>
                        </div>
                    )}
                    {showPuzzle && <CardPuzzle onComplete={handlePuzzleComplete} />}
                </div>
            </div>
            {dialogue && <DialogueBox speaker={dialogue.speaker} text={dialogue.text} choices={dialogue.choices} onNext={dialogue.onNext} npcName={N} playerName={P} />}
        </div>
    );
}
