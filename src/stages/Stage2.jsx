import { useState, useEffect } from 'react';
import { useGame } from '../GameContext';
import DialogueBox from '../components/DialogueBox';
import WaveformSlider from '../minigames/WaveformSlider';
import { FaVolumeHigh } from 'react-icons/fa6';
import { getNpcImage, getPlayerImage, BG_IMAGES } from '../assetMap';

export default function Stage2({ onToolUse }) {
    const { state, addStat, addInventory, useTool, logAccuracy, setStress, setStage } = useGame();
    const N = state.npc.name;
    const P = state.player.name;
    const [step, setStep] = useState(0);
    const [dialogue, setDialogue] = useState(null);
    const [npcState, setNpcState] = useState('anxious');
    const [npcEmotion, setNpcEmotion] = useState('anxious');
    const [playerPose, setPlayerPose] = useState('thinking');
    const [showWaveform, setShowWaveform] = useState(false);
    const [showNoiseIndicator, setShowNoiseIndicator] = useState(false);
    const [vignetteType, setVignetteType] = useState(null);

    useEffect(() => { addInventory('headset'); }, []);
    useEffect(() => { advanceStep(); }, [step]);

    const advanceStep = () => {
        switch (step) {
            /* ── Step 1: 전조 증상 관찰 ── */
            case 0:
                setPlayerPose('thinking');
                setDialogue({
                    speaker: P,
                    text: `(${N} 표정이 안 좋은데... 밥도 안 먹고 숟가락을 딱딱거리고 있어. 왜 저러지?)`,
                    choices: [
                        { text: '🍴 "밥 안 먹어? 빨리 먹어." (재촉)', action: () => { setStep(1); } },
                        { text: '😟 "어디 아파?" (질문)', action: () => { addStat('understanding', 5); setStep(1); } },
                        { text: '👂 주변 소음을 유심히 들어본다 (관찰)', action: () => { addStat('understanding', 10); setStep(1); } },
                    ]
                });
                break;

            /* ── Step 2: 위기 발생 ── */
            case 1:
                setShowNoiseIndicator(true);
                setDialogue({ speaker: 'Narrator', text: '쨍그랑! 옆 테이블에서 누군가 식판을 떨어뜨렸습니다!', onNext: () => setStep(2) });
                break;
            case 2:
                setNpcState('stressed'); setNpcEmotion('tantrum');
                setVignetteType('vignette-red');
                setDialogue({ speaker: N, text: '"으아아악!! 멈춰!! 멈춰!!" (식탁을 내리치고 나를 밀침)', onNext: () => setStep(3) });
                break;

            /* ── Step 3: 갈등 & 선택 ── */
            case 3:
                setPlayerPose('surprised');
                setDialogue({
                    speaker: P,
                    text: '(밀쳐져서 엉덩방아를 찧음) "아, 진짜 아프네!"',
                    choices: [
                        { text: '😡 "너 미쳤어? 왜 사람을 때려!" (같이 화냄)', action: () => setStep(10) },
                        { text: '🏃 선생님을 부르러 뛰어간다 (회피)', action: () => setStep(20) },
                        { text: `👀 ${N}의 상태(귀를 막고 있음)를 확인한다`, action: () => setStep(30) },
                    ]
                });
                break;

            /* ── 4-A: Bad - 같이 화냄 ── */
            case 10:
                addStat('trust', -15); setStress(80);
                setNpcEmotion('pain');
                setDialogue({
                    speaker: N,
                    text: '(더 크게 소리질러 귀를 막음) "아악!! 시끄러워!!"',
                    onNext: () => setStep(40)
                });
                break;

            /* ── 4-B: Normal - 회피 ── */
            case 20:
                addStat('patience', 5);
                setDialogue({
                    speaker: '시스템',
                    text: '선생님이 오시기까지 시간이 걸립니다. 그 사이에도 소음은 계속...',
                    onNext: () => setStep(40)
                });
                break;

            /* ── 4-C: Good - 관찰 ── */
            case 30:
                addStat('understanding', 10); addStat('patience', 10);
                setDialogue({
                    speaker: '시스템',
                    text: `💡 ${N}가 양쪽 귀를 꽉 막고 있는 것이 보입니다. 소리 때문에 고통받고 있어요!`,
                    onNext: () => setStep(40)
                });
                break;

            /* ── Step 4: 미니게임 ── */
            case 40:
                setDialogue({
                    speaker: '시스템',
                    text: `🚨 비상 사태! 소음 수치가 위험합니다! [헤드셋 다이얼]을 조절해 ${N}를 진정시키세요.`
                });
                setShowWaveform(true);
                break;

            /* ── 성공 후 ── */
            case 50:
                setShowWaveform(false); setVignetteType(null); setShowNoiseIndicator(false);
                setNpcEmotion('calm');
                setDialogue({
                    speaker: '시스템',
                    text: `🎧 헤드셋 착용! 시끄러운 소음이 사라지고... 고요해졌어요.`,
                    onNext: () => setStep(51)
                });
                break;
            case 51:
                setNpcState('calm'); setPlayerPose('talk');
                setDialogue({ speaker: N, text: '(거친 숨을 몰아쉬다가 진정함) "...아파. 소리. 아파."', onNext: () => setStep(52) });
                break;
            case 52:
                setDialogue({ speaker: P, text: '"나를 때리려던 게 아니었구나. 소리 때문에 도망치려던 거였어."', onNext: () => setStep(53) });
                break;
            case 53:
                setNpcEmotion('happy');
                setDialogue({
                    speaker: '시스템',
                    text: `🏅 배려의 방패 획득! ${N}처럼 감각이 예민한 친구에게는 우리가 느끼는 소리가 훨씬 크게 들려요.`,
                    onNext: () => setStage('stage-3')
                });
                break;
        }
    };

    const handleWaveformComplete = () => {
        logAccuracy(); useTool('headset');
        addStat('understanding', 20); addStat('trust', 20);
        setStep(50);
    };

    useEffect(() => {
        if (!onToolUse) return;
        onToolUse.current = (id) => { if (id === 'headset' && step === 40) handleWaveformComplete(); };
    }, [step]);

    const npcImg = getNpcImage(state.npc.gender, npcEmotion);
    const playerImg = getPlayerImage(state.player.gender, playerPose);

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 flex flex-col items-center justify-center relative animate-fade-in overflow-hidden">
                <img src={BG_IMAGES.cafeteria} alt="급식실" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/30" />
                {vignetteType && <div className={`absolute inset-0 pointer-events-none z-20 transition-opacity duration-500 ${vignetteType}`} />}
                <div className="z-10 flex flex-col items-center w-full px-4">
                    <div className="text-xl font-bold text-white mb-1 text-center drop-shadow-lg">💥 Stage 2: 폭탄이 터졌다!</div>
                    <div className="text-sm text-white/80 mb-4 text-center drop-shadow">감각 과부하 & 조절</div>
                    {showNoiseIndicator && (
                        <div className="text-center mb-4 animate-fade-in">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/80 backdrop-blur-sm rounded-full">
                                <FaVolumeHigh className="text-white animate-pulse" />
                                <span className="text-sm text-white font-medium">🔊 쨍그랑! 소음 폭발!</span>
                            </div>
                        </div>
                    )}
                    <div className="flex gap-6 mb-4 items-end">
                        <div className="text-center">
                            <div className="w-44 h-56 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg overflow-hidden border border-white/30">
                                <img src={playerImg} alt={P} className="char-img" />
                            </div>
                            <p className="text-sm mt-2 font-medium text-white drop-shadow">{P}</p>
                        </div>
                        <div className="text-center">
                            <div className={`w-44 h-56 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden border border-white/30 transition-all ${npcState === 'stressed' ? 'animate-shake bg-red-500/30 backdrop-blur-sm' : npcState === 'calm' ? 'bg-emerald-500/20 backdrop-blur-sm' : 'bg-white/20 backdrop-blur-sm'}`}>
                                <img src={npcImg} alt={N} className="char-img" />
                            </div>
                            <p className="text-sm mt-2 font-medium text-white drop-shadow">{N}</p>
                        </div>
                    </div>
                    {showWaveform && <WaveformSlider onComplete={handleWaveformComplete} />}
                </div>
            </div>
            {dialogue && <DialogueBox speaker={dialogue.speaker} text={dialogue.text} choices={dialogue.choices} onNext={dialogue.onNext} npcName={N} playerName={P} />}
        </div>
    );
}
