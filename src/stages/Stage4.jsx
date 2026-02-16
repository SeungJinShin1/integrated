import { useState, useEffect } from 'react';
import { useGame } from '../GameContext';
import DialogueBox from '../components/DialogueBox';
import WireConnect from '../minigames/WireConnect';
import { getNpcImage, getPlayerImage, BG_IMAGES } from '../assetMap';

export default function Stage4({ onToolUse }) {
    const { state, addStat, addInventory, useTool, logAccuracy, setStage } = useGame();
    const N = state.npc.name;
    const P = state.player.name;
    const [step, setStep] = useState(0);
    const [dialogue, setDialogue] = useState(null);
    const [npcState, setNpcState] = useState('tapping');
    const [npcEmotion, setNpcEmotion] = useState('default');
    const [playerPose, setPlayerPose] = useState('thinking');
    const [showWire, setShowWire] = useState(false);

    useEffect(() => { addInventory('pecs'); }, []);
    useEffect(() => { advanceStep(); }, [step]);

    const advanceStep = () => {
        switch (step) {
            /* ── Step 1: 조별 과제 위기 ── */
            case 0:
                setPlayerPose('thinking');
                setDialogue({
                    speaker: '조원 A',
                    text: `"아, 짜증 나. 이거 불량품 아냐? 야, ${N} 너는 건드리지 말고 가만히 있어."`,
                    onNext: () => setStep(1)
                });
                break;
            case 1:
                setNpcEmotion('memory');
                setDialogue({
                    speaker: N,
                    text: '(손가락으로 회로도의 한 부분을 계속 톡톡 침) "파랑... 빨강... 반대... 파랑... 빨강..."',
                    onNext: () => setStep(2)
                });
                break;

            /* ── Step 2: 선택 ── */
            case 2:
                setDialogue({
                    speaker: P,
                    text: `(${N}(이)가 계속 뭔가 중얼거리고 있다...)`,
                    choices: [
                        { text: '🤫 "조용히 좀 해봐. 집중 안 되잖아."', action: () => setStep(10) },
                        { text: '✋ "얘들아, 잠깐만. 승주가 뭔가 말하려는 것 같아."', action: () => setStep(20) },
                        { text: '🔍 승주의 손끝이 가리키는 곳을 자세히 본다', action: () => setStep(30) },
                    ]
                });
                break;

            /* ── Bad: 무시 ── */
            case 10:
                addStat('trust', -10);
                setNpcEmotion('anxious');
                setDialogue({
                    speaker: N,
                    text: '(움츠러들며 조용해짐. 하지만 계속 회로를 바라봄)',
                    onNext: () => setStep(40)
                });
                break;

            /* ── Good: 중재 ── */
            case 20:
                addStat('trust', 10); addStat('communication', 10);
                setDialogue({
                    speaker: '조원 A',
                    text: '"뭐? 뭘 말하려는 건데?"',
                    onNext: () => setStep(40)
                });
                break;

            /* ── Best: 관찰 ── */
            case 30:
                addStat('understanding', 15); addStat('trust', 10);
                setDialogue({
                    speaker: '시스템',
                    text: `💡 ${N}의 손끝이 전선이 꼬인 부분을 정확히 가리키고 있습니다!`,
                    onNext: () => setStep(40)
                });
                break;

            /* ── Step 3: 미니게임 ── */
            case 40:
                setNpcState('eagle'); setNpcEmotion('discover');
                setDialogue({
                    speaker: '시스템',
                    text: `💎 이글 아이(Eagle Eye) 발동! ${N}(이)가 발견한 오류를 수정하세요.`
                });
                setShowWire(true);
                break;

            /* ── 성공 ── */
            case 50:
                setShowWire(false);
                setPlayerPose('talk');
                setDialogue({ speaker: P, text: `"${N}아, 네가 찾았어! 네 덕분에 불이 켜졌어!"`, onNext: () => setStep(51) });
                break;
            case 51:
                setNpcState('fixing'); setNpcEmotion('happy');
                setDialogue({
                    speaker: '조원 A',
                    text: `"헐, 대박. ${N} 너 천재야? 우리가 1등이다!"`,
                    onNext: () => setStep(52)
                });
                break;
            case 52:
                setDialogue({
                    speaker: '시스템',
                    text: `🏅 협력의 전구 획득! ${N}의 반복 행동은 집중의 신호였어요. 남다른 시각 능력이 팀을 위기에서 구했어요!`,
                    onNext: () => setStage('stage-5')
                });
                break;
        }
    };

    const handleWireComplete = () => {
        logAccuracy(); useTool('pecs');
        addStat('understanding', 20); addStat('trust', 20);
        setStep(50);
    };

    useEffect(() => {
        if (!onToolUse) return;
        onToolUse.current = (id) => { if (id === 'pecs' && step === 40) handleWireComplete(); };
    }, [step]);

    const npcImg = getNpcImage(state.npc.gender, npcEmotion);
    const playerImg = getPlayerImage(state.player.gender, playerPose);

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 flex flex-col items-center justify-center relative animate-fade-in overflow-hidden">
                <img src={BG_IMAGES.sciencelab} alt="과학실" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/30" />
                <div className="z-10 flex flex-col items-center w-full px-4">
                    <div className="text-xl font-bold text-white mb-1 text-center drop-shadow-lg">🧩 Stage 4: 사라진 퍼즐 조각</div>
                    <div className="text-sm text-white/80 mb-4 text-center drop-shadow">강점 & 협력</div>
                    <div className="flex gap-6 mb-4 items-end justify-center">
                        <div className="text-center">
                            <div className="w-44 h-56 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg overflow-hidden border border-white/30">
                                <img src={playerImg} alt={P} className="char-img" />
                            </div>
                            <p className="text-sm mt-2 font-medium text-white drop-shadow">{P}</p>
                        </div>
                        <div className="text-center">
                            <div className={`w-44 h-56 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden border border-white/30 transition-all ${npcState === 'eagle' ? 'animate-pulse bg-amber-500/30 backdrop-blur-sm' :
                                npcState === 'fixing' ? 'bg-emerald-500/20 backdrop-blur-sm' :
                                    'bg-white/20 backdrop-blur-sm'}`}>
                                <img src={npcImg} alt={N} className="char-img" />
                            </div>
                            <p className="text-sm mt-2 font-medium text-white drop-shadow">{N}</p>
                        </div>
                    </div>
                    {showWire && <WireConnect onComplete={handleWireComplete} />}
                </div>
            </div>
            {dialogue && <DialogueBox speaker={dialogue.speaker} text={dialogue.text} choices={dialogue.choices} onNext={dialogue.onNext} npcName={N} playerName={P} />}
        </div>
    );
}
