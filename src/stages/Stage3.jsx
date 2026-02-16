import { useState, useEffect } from 'react';
import { useGame } from '../GameContext';
import DialogueBox from '../components/DialogueBox';
import TimerDial from '../minigames/TimerDial';
import { getNpcImage, getPlayerImage, BG_IMAGES } from '../assetMap';

export default function Stage3({ onToolUse }) {
    const { state, addStat, addInventory, useTool, logAccuracy, setStage } = useGame();
    const N = state.npc.name;
    const P = state.player.name;
    const [step, setStep] = useState(0);
    const [dialogue, setDialogue] = useState(null);
    const [npcState, setNpcState] = useState('playing');
    const [npcEmotion, setNpcEmotion] = useState('happy');
    const [playerPose, setPlayerPose] = useState('talk');
    const [showDial, setShowDial] = useState(false);

    useEffect(() => { addInventory('timer'); }, []);
    useEffect(() => { advanceStep(); }, [step]);

    const advanceStep = () => {
        switch (step) {
            /* ── Step 1: 몰입의 시간 ── */
            case 0:
                setNpcEmotion('happy');
                setDialogue({
                    speaker: N,
                    text: '"여기는 사당역. 환승입니다. 2호선 띠리리링~" (매우 즐거워 보임)',
                    onNext: () => setStep(1)
                });
                break;
            case 1:
                setPlayerPose('thinking');
                setDialogue({
                    speaker: '시스템',
                    text: `점심시간이 끝났는데 ${N}(이)가 운동장 바닥에 그림을 그리고 있습니다.`,
                    choices: [
                        { text: '🏃 "야, 종 쳤어! 가자!" (잡아끈다)', action: () => setStep(10) },
                        { text: '🚂 "우와, 이거 지하철 노선도야?"', action: () => setStep(20) },
                    ]
                });
                break;

            /* ── Bad: 강제 이동 ── */
            case 10:
                setNpcState('stressed'); setNpcEmotion('tantrum');
                addStat('trust', -10);
                setDialogue({
                    speaker: N,
                    text: '(바닥에 드러누우며) "안 가!! 기차 출발 안 했어!!"',
                    onNext: () => setStep(12)
                });
                break;
            case 12:
                setDialogue({
                    speaker: '선생님',
                    text: '"5학년 3반, 5교시 시작합니다. 모두 착석하세요."',
                    onNext: () => setStep(30)
                });
                break;

            /* ── Good: 관심사 공유 ── */
            case 20:
                addStat('trust', 10);
                setNpcEmotion('memory');
                setDialogue({
                    speaker: N,
                    text: '(신나서) "사당역 다음은 낙성대. 그 다음은 서울대입구..."',
                    onNext: () => setStep(21)
                });
                break;
            case 21:
                setDialogue({
                    speaker: '선생님',
                    text: '"5학년 3반, 5교시 시작합니다. 모두 착석하세요."',
                    onNext: () => setStep(22)
                });
                break;
            case 22:
                setDialogue({
                    speaker: '시스템',
                    text: `${N}는 여전히 교실에 가려고 하지 않습니다. 관심사를 존중하면서도 전환이 필요해요.`,
                    onNext: () => setStep(30)
                });
                break;

            /* ── Step 3: 미니게임 ── */
            case 30:
                setDialogue({
                    speaker: '시스템',
                    text: `⏳ 말로만 하면 통하지 않습니다. [구글 타이머]로 눈에 보이는 약속을 하세요!`
                });
                setShowDial(true);
                break;

            /* ── 성공 ── */
            case 40:
                setShowDial(false);
                setPlayerPose('talk');
                setDialogue({
                    speaker: P,
                    text: `"${N}아, 이 빨간색이 다 사라지면 기차는 '교실역'으로 출발하는 거야. 딱 5분만 더 하자."`,
                    onNext: () => setStep(41)
                });
                break;
            case 41:
                setNpcState('calm'); setNpcEmotion('happy');
                setDialogue({
                    speaker: N,
                    text: '(타이머가 울리자 벌떡 일어남) "운행 종료. 교실역으로 출발합니다. 칙칙폭폭."',
                    onNext: () => setStep(42)
                });
                break;
            case 42:
                setDialogue({
                    speaker: '시스템',
                    text: `🏅 약속의 시계 획득! 갑작스러운 변화가 힘든 친구에게는 미리 준비할 시간과 흥미로운 제안이 효과적이에요.`,
                    onNext: () => setStage('stage-4')
                });
                break;
        }
    };

    const handleDialComplete = () => {
        logAccuracy(); useTool('timer');
        addStat('communication', 20); addStat('patience', 20);
        setStep(40);
    };

    useEffect(() => {
        if (!onToolUse) return;
        onToolUse.current = (id) => { if (id === 'timer' && step === 30) handleDialComplete(); };
    }, [step]);

    const npcImg = getNpcImage(state.npc.gender, npcEmotion);
    const playerImg = getPlayerImage(state.player.gender, playerPose);

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 flex flex-col items-center justify-center relative animate-fade-in overflow-hidden">
                <img src={BG_IMAGES.playground} alt="운동장" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/30" />
                <div className="z-10 flex flex-col items-center w-full px-4">
                    <div className="text-xl font-bold text-white mb-1 drop-shadow-lg">🚂 Stage 3: 기차는 멈추지 않아</div>
                    <div className="text-sm text-white/80 mb-4 drop-shadow">전이 & 시각적 지원</div>
                    <div className="flex gap-6 mb-4 items-end">
                        <div className="text-center">
                            <div className="w-44 h-56 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg overflow-hidden border border-white/30">
                                <img src={playerImg} alt={P} className="char-img" />
                            </div>
                            <p className="text-sm mt-2 font-medium text-white drop-shadow">{P}</p>
                        </div>
                        <div className="text-center">
                            <div className={`w-44 h-56 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden border border-white/30 transition-all ${npcState === 'stressed' ? 'animate-shake bg-red-500/30 backdrop-blur-sm' :
                                npcState === 'playing' ? 'animate-pulse bg-amber-500/15 backdrop-blur-sm' :
                                    npcState === 'calm' ? 'bg-emerald-500/20 backdrop-blur-sm' :
                                        'bg-white/20 backdrop-blur-sm'}`}>
                                <img src={npcImg} alt={N} className="char-img" />
                            </div>
                            <p className="text-sm mt-2 font-medium text-white drop-shadow">{N}</p>
                        </div>
                    </div>
                    {/* 지하철 노선도 */}
                    {(npcState === 'playing' && step < 30) && (
                        <div className="w-64 h-8 bg-white/80 backdrop-blur-sm rounded-full border-2 border-white/50 relative mb-4 overflow-hidden">
                            <div className="absolute inset-0 flex items-center justify-between px-3 z-10">
                                {['사당', '낙성대', '서울대', '봉천', '신림'].map((st, i) => (
                                    <div key={i} className="flex flex-col items-center">
                                        <div className="w-2.5 h-2.5 rounded-full bg-green-500 border border-white" />
                                        <span className="text-[8px] text-slate-600 mt-0.5">{st}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="absolute top-1/2 left-2 right-2 h-0.5 bg-green-400 -translate-y-1/2" />
                        </div>
                    )}
                    {showDial && <TimerDial onComplete={handleDialComplete} />}
                </div>
            </div>
            {dialogue && <DialogueBox speaker={dialogue.speaker} text={dialogue.text} choices={dialogue.choices} onNext={dialogue.onNext} npcName={N} playerName={P} />}
        </div>
    );
}
