import { useState, useEffect } from 'react';
import { useGame } from '../GameContext';
import DialogueBox from '../components/DialogueBox';
import PecsCardPuzzle from '../minigames/PecsCardPuzzle';
import MosaicPuzzle from '../minigames/MosaicPuzzle';
import { getNpcImage, getPlayerImage, BG_IMAGES } from '../assetMap';

export default function Stage4({ onToolUse }) {
    const { state, addStat, addInventory, useTool, logAccuracy, setStage } = useGame();
    const N = state.npc.name;
    const P = state.player.name;
    const [step, setStep] = useState(0);
    const [dialogue, setDialogue] = useState(null);
    const [npcState, setNpcState] = useState('observing');
    const [npcEmotion, setNpcEmotion] = useState('default');
    const [playerPose, setPlayerPose] = useState('thinking');
    const [showPecs, setShowPecs] = useState(false);
    const [showMosaic, setShowMosaic] = useState(false);

    useEffect(() => { addInventory('pecs'); }, []);
    useEffect(() => { advanceStep(); }, [step]);

    const advanceStep = () => {
        switch (step) {
            /* ── Step 1: 미술 시간 위기 ── */
            case 0:
                setPlayerPose('thinking');
                setDialogue({
                    speaker: '시스템',
                    text: '🎨 미술 시간, 거대한 모자이크 벽화를 만들고 있습니다. 하늘 부분의 파란색 그라데이션이 너무 복잡해서 마지막 조각을 못 찾고 있어요.',
                    onNext: () => setStep(1)
                });
                break;
            case 1:
                setDialogue({
                    speaker: '조원 A',
                    text: '"아, 이게 다 똑같은 파란색이지 뭐야? 도대체 뭐가 맞는 조각이야?"',
                    onNext: () => setStep(2)
                });
                break;
            case 2:
                setNpcEmotion('memory');
                setDialogue({
                    speaker: N,
                    text: '(바닥에 떨어진 수많은 조각 중 하나를 집어 들고, 벽화의 빈 곳을 번갈아 쳐다본다)',
                    onNext: () => setStep(3)
                });
                break;

            /* ── Step 2: 위기 - 배제 ── */
            case 3:
                setDialogue({
                    speaker: '조원 B',
                    text: `"${N}아, 그거 내려놔. 섞이면 더 골치 아파져. 그냥 앉아 있어."`,
                    onNext: () => setStep(4)
                });
                break;

            /* ── Step 3: 선택 ── */
            case 4:
                setDialogue({
                    speaker: P,
                    text: `(${N}(이)가 조각을 들고 무언가 보여주려 하고 있다...)`,
                    choices: [
                        { text: `🤫 "그래 ${N}아, 넌 가만히 있는 게 도와주는 거야." (배제)`, action: () => setStep(10) },
                        { text: `✋ "${N}가 뭘 하려는지 한번 볼까?" (관찰)`, action: () => setStep(20) },
                        { text: `🔍 "${N}아, 이거 네가 해볼래?" (참여 유도)`, action: () => setStep(30) },
                    ]
                });
                break;

            /* ── Bad: 무시 ── */
            case 10:
                addStat('trust', -10);
                setNpcEmotion('anxious');
                setDialogue({
                    speaker: N,
                    text: '(움츠러들지만 여전히 조각을 꼭 쥐고 있음)',
                    onNext: () => setStep(40)
                });
                break;

            /* ── Good: 중재 ── */
            case 20:
                addStat('trust', 10); addStat('communication', 10);
                setDialogue({
                    speaker: '조원 A',
                    text: '"뭐? 뭘 찾은 건데?" (조원 A가 승주에게 관심을 보인다)',
                    onNext: () => setStep(40)
                });
                break;

            /* ── Best: 관찰 ── */
            case 30:
                addStat('understanding', 15); addStat('trust', 10);
                setDialogue({
                    speaker: '시스템',
                    text: `💡 ${N}(이)가 든 조각의 그라데이션이... 빈칸과 정확히 맞는 것 같습니다!`,
                    onNext: () => setStep(40)
                });
                break;

            /* ── Step 3: PECS 카드 조합 (미니게임1) ── */
            case 40:
                setNpcState('focused'); setNpcEmotion('discover');
                setDialogue({
                    speaker: '시스템',
                    text: `💬 ${N}(이)가 주머니에서 PECS 카드 뭉치를 꺼냅니다. 카드를 확인하세요!`,
                });
                setShowPecs(true);
                break;

            /* ── PECS 성공 후 반응 ── */
            case 41:
                setShowPecs(false);
                setPlayerPose('talk');
                setDialogue({
                    speaker: P,
                    text: `"뭐? 네가 할 수 있다고? 그래, 한번 해봐!"`,
                    onNext: () => setStep(42),
                });
                break;

            /* ── Step 4: 모자이크 퍼즐 (미니게임2) ── */
            case 42:
                setDialogue({
                    speaker: '시스템',
                    text: `🧩 ${N}(이)의 눈에는 미세한 색깔의 차이가 선명한 패턴으로 보입니다. 조각을 돌려 맞추세요!`,
                });
                setShowMosaic(true);
                break;

            /* ── 성공 ── */
            case 50:
                setShowMosaic(false);
                setPlayerPose('talk');
                setDialogue({ speaker: P, text: `"${N}아, 네가 찾았어! 우린 다 똑같아 보였는데, 넌 이걸 어떻게 구분했어?"`, onNext: () => setStep(51) });
                break;
            case 51:
                setNpcState('proud'); setNpcEmotion('happy');
                setDialogue({
                    speaker: '조원 A',
                    text: `"우와... 딱 맞네? 우린 다 똑같아 보였는데, 넌 이걸 어떻게 구별했어?" (조원 A가 놀란다)`,
                    onNext: () => setStep(52)
                });
                break;
            case 52:
                setDialogue({
                    speaker: '시스템',
                    text: `🏅 협력의 전구 획득! 남들은 구분 못하는 미세한 색깔 차이를 ${N}(이)는 단번에 알아챘어요. 네 덕분에 완성했어!`,
                    onNext: () => setStage('stage-5')
                });
                break;
        }
    };

    const handlePecsComplete = () => {
        addStat('communication', 10);
        setStep(41);
    };

    const handleMosaicComplete = () => {
        logAccuracy(); useTool('pecs');
        addStat('understanding', 20); addStat('trust', 20);
        setShowMosaic(false);
        setStep(50);
    };

    useEffect(() => {
        if (!onToolUse) return;
        onToolUse.current = (id) => { if (id === 'pecs' && step === 42) handleMosaicComplete(); };
    }, [step]);

    const npcImg = getNpcImage(state.npc.gender, npcEmotion);
    const playerImg = getPlayerImage(state.player.gender, playerPose);

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 flex flex-col items-center justify-center relative animate-fade-in overflow-hidden">
                <img src={BG_IMAGES.classroom} alt="미술 시간" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/30" />
                <div className="z-10 flex flex-col items-center w-full px-4">
                    <div className="text-xl font-bold text-white mb-1 text-center drop-shadow-lg">🧩 Stage 4: 사라진 퍼즐 조각</div>
                    <div className="text-sm text-white/80 mb-3 text-center drop-shadow">강점 & 주체성</div>
                    <div className="flex gap-4 mb-3 items-start justify-center w-full max-w-lg">
                        <div className="text-center flex-shrink-0">
                            <div className="w-32 h-40 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg overflow-hidden border border-white/30">
                                <img src={playerImg} alt={P} className="char-img" />
                            </div>
                            <p className="text-sm mt-1 font-medium text-white drop-shadow">{P}</p>
                        </div>
                        <div className="flex-1 flex items-center justify-center min-h-[10rem]">
                            {showPecs && <PecsCardPuzzle npcName={N} onComplete={handlePecsComplete} />}
                            {showMosaic && <MosaicPuzzle onComplete={handleMosaicComplete} />}
                        </div>
                        <div className="text-center flex-shrink-0">
                            <div className={`w-32 h-40 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden border border-white/30 transition-all ${npcState === 'focused' ? 'animate-pulse bg-amber-500/30 backdrop-blur-sm' :
                                npcState === 'proud' ? 'bg-emerald-500/20 backdrop-blur-sm' :
                                    'bg-white/20 backdrop-blur-sm'}`}>
                                <img src={npcImg} alt={N} className="char-img" />
                            </div>
                            <p className="text-sm mt-1 font-medium text-white drop-shadow">{N}</p>
                        </div>
                    </div>
                </div>
            </div>
            {dialogue && <DialogueBox speaker={dialogue.speaker} text={dialogue.text} choices={dialogue.choices} onNext={dialogue.onNext} npcName={N} playerName={P} />}
        </div>
    );
}
