'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useGame } from '@/contexts/GameContext';
import TopNavBar from '@/components/layout/TopNavBar';
import DialogueBox from '@/components/game/DialogueBox';
import { getNpcImage, getPlayerImage, BG_IMAGES } from '@/data/assetMap';
import { DialogueData } from '@/types';
import StageTransition from '@/components/game/StageTransition';
import dynamic from 'next/dynamic';

// Dynamic imports for minigames to keep bundle size manageable
const CardPuzzle = dynamic(() => import('@/components/minigames/CardPuzzle'), { ssr: false });
const WaveformSlider = dynamic(() => import('@/components/minigames/WaveformSlider'), { ssr: false });
const TimerDial = dynamic(() => import('@/components/minigames/TimerDial'), { ssr: false });
const SquishyBreath = dynamic(() => import('@/components/minigames/SquishyBreath'), { ssr: false });
const PecsCardPuzzle = dynamic(() => import('@/components/minigames/PecsCardPuzzle'), { ssr: false });
const MosaicPuzzle = dynamic(() => import('@/components/minigames/MosaicPuzzle'), { ssr: false });
const ScratchFog = dynamic(() => import('@/components/minigames/ScratchFog'), { ssr: false });

// ===== Stage 1: 앵무새의 숲 =====
function Stage1() {
  const { state, addStat, addInventory, useTool, logAccuracy, completeStage, logWaiting } = useGame();
  const router = useRouter();
  const N = state.npc.name;
  const P = state.player.name;
  const [step, setStep] = useState(0);
  const [dialogue, setDialogue] = useState<DialogueData | null>(null);
  const [npcEmotion, setNpcEmotion] = useState('default');
  const [playerPose, setPlayerPose] = useState('thinking');
  const [showMinigame, setShowMinigame] = useState(false);

  useEffect(() => { addInventory('aac'); }, []);

  useEffect(() => {
    switch (step) {
      case 0:
        setPlayerPose('thinking');
        setDialogue({
          speaker: P, text: `(쉬는 시간. ${N}(이)가 교실 한 구석에서 혼자 무언가를 반복하고 있다. 다가가볼까?)`,
          choices: [
            { text: `🗣️ "${N}아, 뭐 하고 있어?" (말 걸기)`, action: () => { addStat('communication', 5); setStep(1); } },
            { text: `👀 조용히 옆에 앉아본다 (관찰)`, action: () => { logWaiting(); addStat('patience', 10); setStep(1); } },
          ]
        });
        break;
      case 1:
        setNpcEmotion('memory');
        setDialogue({
          speaker: N, text: `"노란색... 노란색... 노란색..."`,
          onNext: () => setStep(2),
        });
        break;
      case 2:
        setDialogue({
          speaker: '시스템', text: `💡 ${N}(이)가 같은 말을 반복합니다. 이런 현상을 "반향어(에코랄리아)"라고 해요.`,
          choices: [
            { text: `😤 "${N}아, 무슨 말인지 모르겠어! 똑바로 말해!" (화남)`, action: () => { addStat('trust', -10); setStep(10); } },
            { text: `🤔 "노란색? 혹시 노란색이 필요한 거야?" (해석 시도)`, action: () => { addStat('understanding', 10); setStep(20); } },
          ]
        });
        break;
      case 10:
        setNpcEmotion('anxious');
        setDialogue({
          speaker: N, text: '(움츠러들며 더 작은 소리로) "노란색... 노란색..."',
          onNext: () => setStep(20),
        });
        break;
      case 20:
        setDialogue({
          speaker: '시스템', text: `🎮 AAC 태블릿으로 ${N}(이)가 말하고 싶은 것을 찾아보세요!`,
        });
        setShowMinigame(true);
        break;
      case 30:
        setShowMinigame(false);
        setNpcEmotion('happy');
        setDialogue({
          speaker: N, text: '(AAC에서 "노란색 크레파스" 그림을 가리키며) "노란색!"',
          onNext: () => setStep(31),
        });
        break;
      case 31:
        setPlayerPose('talk');
        setDialogue({
          speaker: P, text: `"아, 노란색 크레파스를 찾고 있었구나!"`,
          onNext: () => setStep(32),
        });
        break;
      case 32:
        setDialogue({
          speaker: '시스템',
          text: `🏅 소통의 배지 획득! ${N}(이)가 "노란색"이라고 반복한 건 노란색 크레파스가 필요했기 때문이에요.`,
          onNext: () => {
            completeStage('stage-1');
            router.push('/high');
          },
        });
        break;
    }
  }, [step]);

  const handleMinigameComplete = () => {
    logAccuracy(); useTool('aac');
    addStat('communication', 20); addStat('understanding', 10);
    setStep(30);
  };

  const npcImg = getNpcImage(state.npc.gender, npcEmotion);
  const playerImg = getPlayerImage(state.player.gender, playerPose);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <img src={BG_IMAGES.breaktime} alt="쉬는시간" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)' }} />

      <div className="stage-header">
        <div className="stage-title">🦜 1단계: 앵무새의 숲</div>
        <div className="stage-subtitle">반향어 & 소통</div>
      </div>

      {/* Characters */}
      <div className="character-container">
        <div style={{ textAlign: 'center' }}>
          <img src={playerImg} alt={P} className="character-sprite" />
          <div className="character-name-tag">{P}</div>
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: 160, right: 24, textAlign: 'center', zIndex: 90 }}>
        <img src={npcImg} alt={N} className="character-sprite" />
        <div className="character-name-tag">{N}</div>
      </div>

      {showMinigame && (
        <div className="minigame-area">
          <CardPuzzle npcName={N} onComplete={handleMinigameComplete} />
        </div>
      )}

      {dialogue && <DialogueBox {...dialogue} npcName={N} playerName={P} />}
    </div>
  );
}

// ===== Stage 2: 폭탄이 터졌다! =====
function Stage2() {
  const { state, addStat, addInventory, useTool, logAccuracy, completeStage, setStress, logWaiting } = useGame();
  const router = useRouter();
  const N = state.npc.name;
  const P = state.player.name;
  const [step, setStep] = useState(0);
  const [dialogue, setDialogue] = useState<DialogueData | null>(null);
  const [npcEmotion, setNpcEmotion] = useState('anxious');
  const [playerPose, setPlayerPose] = useState('thinking');
  const [showMinigame, setShowMinigame] = useState(false);
  const [vignetteRed, setVignetteRed] = useState(false);

  useEffect(() => { addInventory('headset'); }, []);

  useEffect(() => {
    switch (step) {
      case 0:
        setDialogue({
          speaker: P, text: `(${N} 표정이 안 좋은데... 밥도 안 먹고 숟가락을 딱딱거리고 있어. 왜 저러지?)`,
          choices: [
            { text: '🍴 "밥 안 먹어? 빨리 먹어." (재촉)', action: () => setStep(1) },
            { text: '😟 "어디 아파?" (질문)', action: () => { addStat('understanding', 5); setStep(1); } },
            { text: '👂 주변 소음을 유심히 들어본다 (관찰)', action: () => { addStat('understanding', 10); logWaiting(); setStep(1); } },
          ]
        });
        break;
      case 1:
        setDialogue({ speaker: 'Narrator', text: '쨍그랑! 옆 테이블에서 누군가 식판을 떨어뜨렸습니다!', onNext: () => setStep(2) });
        break;
      case 2:
        setNpcEmotion('tantrum'); setVignetteRed(true);
        setDialogue({ speaker: N, text: '"으아아악!! 멈춰!! 멈춰!!" (식탁을 내리치고 나를 밀침)', onNext: () => setStep(3) });
        break;
      case 3:
        setPlayerPose('surprised');
        setDialogue({
          speaker: P, text: `(밀쳐져서 엉덩방아를 찧음) "아, 진짜 아프네!"`,
          choices: [
            { text: '😡 "너 미쳤어? 왜 사람을 때려!" (같이 화냄)', action: () => { addStat('trust', -15); setStress(80); setStep(10); } },
            { text: '🏃 선생님을 부르러 뛰어간다 (회피)', action: () => { addStat('patience', 5); setStep(20); } },
            { text: `👀 ${N}의 상태(귀를 막고 있음)를 확인한다`, action: () => { logWaiting(); addStat('understanding', 10); addStat('patience', 10); setStep(30); } },
          ]
        });
        break;
      case 10:
        setNpcEmotion('pain');
        setDialogue({ speaker: N, text: '(더 크게 소리질러 귀를 막음) "아악!! 시끄러워!!"', onNext: () => setStep(40) });
        break;
      case 20:
        setDialogue({ speaker: '시스템', text: '선생님이 오시기까지 시간이 걸립니다. 그 사이에도 소음은 계속...', onNext: () => setStep(40) });
        break;
      case 30:
        setDialogue({ speaker: '시스템', text: `💡 ${N}가 양쪽 귀를 꽉 막고 있는 것이 보입니다. 소리 때문에 고통받고 있어요!`, onNext: () => setStep(40) });
        break;
      case 40:
        setDialogue({ speaker: '시스템', text: `🚨 비상 사태! 소음 수치가 위험합니다! [헤드셋 다이얼]을 조절해 ${N}를 진정시키세요.` });
        setShowMinigame(true);
        break;
      case 50:
        setShowMinigame(false); setVignetteRed(false);
        setNpcEmotion('calm');
        setDialogue({ speaker: '시스템', text: '🎧 헤드셋 착용! 시끄러운 소음이 사라지고... 고요해졌어요.', onNext: () => setStep(51) });
        break;
      case 51:
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
          onNext: () => { completeStage('stage-2'); router.push('/high'); },
        });
        break;
    }
  }, [step]);

  const handleMinigameComplete = () => {
    logAccuracy(); useTool('headset');
    addStat('understanding', 20); addStat('trust', 20);
    setStep(50);
  };

  const npcImg = getNpcImage(state.npc.gender, npcEmotion);
  const playerImg = getPlayerImage(state.player.gender, playerPose);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <img src={BG_IMAGES.cafeteria} alt="급식실" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)' }} />
      {vignetteRed && <div className="vignette-red" style={{ position: 'absolute', inset: 0, zIndex: 20 }} />}

      <div className="stage-header">
        <div className="stage-title">💥 2단계: 폭탄이 터졌다!</div>
        <div className="stage-subtitle">감각 과부하 & 조절</div>
      </div>

      <div className="character-container">
        <div style={{ textAlign: 'center' }}>
          <img src={playerImg} alt={P} className="character-sprite" />
          <div className="character-name-tag">{P}</div>
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: 160, right: 24, textAlign: 'center', zIndex: 90 }}>
        <img src={npcImg} alt={N} className="character-sprite" />
        <div className="character-name-tag">{N}</div>
      </div>

      {showMinigame && <div className="minigame-area"><WaveformSlider onComplete={handleMinigameComplete} /></div>}
      {dialogue && <DialogueBox {...dialogue} npcName={N} playerName={P} />}
    </div>
  );
}

// ===== Stage 3: 기차는 멈추지 않아 =====
function Stage3() {
  const { state, addStat, addInventory, useTool, logAccuracy, completeStage, logWaiting } = useGame();
  const router = useRouter();
  const N = state.npc.name;
  const P = state.player.name;
  const [step, setStep] = useState(0);
  const [dialogue, setDialogue] = useState<DialogueData | null>(null);
  const [npcEmotion, setNpcEmotion] = useState('happy');
  const [playerPose, setPlayerPose] = useState('talk');
  const [showDial, setShowDial] = useState(false);
  const [showSquishy, setShowSquishy] = useState(false);

  useEffect(() => { addInventory('timer'); }, []);

  useEffect(() => {
    switch (step) {
      case 0:
        setDialogue({ speaker: N, text: '"여기는 사당역. 환승입니다. 2호선 띠리리링~" (매우 즐거워 보임)', onNext: () => setStep(1) });
        break;
      case 1:
        setDialogue({
          speaker: '시스템', text: `점심시간이 끝났는데 ${N}(이)가 운동장 바닥에 그림을 그리고 있습니다.`,
          choices: [
            { text: '🏃 "야, 종 쳤어! 가자!" (잡아끈다)', action: () => { addStat('trust', -10); setStep(10); } },
            { text: `🚂 "우와, 이거 지하철 노선도야?"`, action: () => { logWaiting(); addStat('trust', 10); setStep(20); } },
          ]
        });
        break;
      case 10:
        setNpcEmotion('tantrum');
        setDialogue({ speaker: N, text: '(바닥에 드러누우며) "안 가!! 기차 출발 안 했어!!"', onNext: () => setStep(30) });
        break;
      case 20:
        setNpcEmotion('memory');
        setDialogue({ speaker: N, text: '(신나서) "사당역 다음은 낙성대. 그 다음은 서울대입구..."', onNext: () => setStep(30) });
        break;
      case 30:
        setDialogue({ speaker: '시스템', text: '⏳ 말로만 하면 통하지 않습니다. [구글 타이머]로 눈에 보이는 약속을 하세요!' });
        setShowDial(true);
        break;
      case 40:
        setShowDial(false);
        setDialogue({ speaker: P, text: `"${N}아, 이 빨간색이 다 사라지면 기차는 '교실역'으로 출발하는 거야."`, onNext: () => setStep(41) });
        break;
      case 41:
        setNpcEmotion('anxious');
        setDialogue({ speaker: N, text: '"5분 길어. 지금? 아니야? 으으으..." (손톱을 물어뜯으며 다리를 떤다)', onNext: () => setStep(42) });
        break;
      case 42:
        addInventory('squishy');
        setDialogue({ speaker: '시스템', text: '😰 기다리는 시간은 지루하고 불안합니다. [말랑이]로 긴장을 풀어주세요!' });
        setShowSquishy(true);
        break;
      case 50:
        setShowSquishy(false);
        setNpcEmotion('happy');
        setDialogue({ speaker: N, text: '(타이머 종료. 차분하게 일어남) "종점. 교실역. 출발."', onNext: () => setStep(51) });
        break;
      case 51:
        setDialogue({ speaker: P, text: '"기다려줘서 고마워! 늦지 않게 전속력으로 가자!"', onNext: () => setStep(52) });
        break;
      case 52:
        setDialogue({
          speaker: '시스템',
          text: '🏅 약속의 시계 획득! 갑작스러운 변화가 힘든 친구에게는 미리 준비할 시간과 감각 조절 도구가 효과적이에요.',
          onNext: () => { completeStage('stage-3'); router.push('/high'); },
        });
        break;
    }
  }, [step]);

  const handleDialComplete = () => { logAccuracy(); useTool('timer'); addStat('communication', 20); addStat('patience', 20); setStep(40); };
  const handleSquishyComplete = () => { useTool('squishy'); addStat('patience', 10); addStat('trust', 10); setStep(50); };

  const npcImg = getNpcImage(state.npc.gender, npcEmotion);
  const playerImg = getPlayerImage(state.player.gender, playerPose);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <img src={BG_IMAGES.playground} alt="운동장" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)' }} />
      <div className="stage-header"><div className="stage-title">🚂 3단계: 기차는 멈추지 않아</div><div className="stage-subtitle">전이 & 감각 조절</div></div>
      <div className="character-container"><div style={{ textAlign: 'center' }}><img src={playerImg} alt={P} className="character-sprite" /><div className="character-name-tag">{P}</div></div></div>
      <div style={{ position: 'absolute', bottom: 160, right: 24, textAlign: 'center', zIndex: 90 }}><img src={npcImg} alt={N} className="character-sprite" /><div className="character-name-tag">{N}</div></div>
      {showDial && <div className="minigame-area"><TimerDial onComplete={handleDialComplete} /></div>}
      {showSquishy && <div className="minigame-area"><SquishyBreath onComplete={handleSquishyComplete} /></div>}
      {dialogue && <DialogueBox {...dialogue} npcName={N} playerName={P} />}
    </div>
  );
}

// ===== Stage 4: 사라진 퍼즐 조각 =====
function Stage4() {
  const { state, addStat, addInventory, useTool, logAccuracy, completeStage, logWaiting } = useGame();
  const router = useRouter();
  const N = state.npc.name;
  const P = state.player.name;
  const [step, setStep] = useState(0);
  const [dialogue, setDialogue] = useState<DialogueData | null>(null);
  const [npcEmotion, setNpcEmotion] = useState('default');
  const [playerPose, setPlayerPose] = useState('thinking');
  const [showPecs, setShowPecs] = useState(false);
  const [showMosaic, setShowMosaic] = useState(false);

  useEffect(() => { addInventory('pecs'); }, []);

  useEffect(() => {
    switch (step) {
      case 0:
        setDialogue({ speaker: '시스템', text: '🎨 미술 시간, 거대한 모자이크 벽화를 만들고 있습니다. 하늘 부분의 파란색 그라데이션이 너무 복잡해서 마지막 조각을 못 찾고 있어요.', onNext: () => setStep(1) });
        break;
      case 1:
        setDialogue({ speaker: '조원 A', text: '"아, 이게 다 똑같은 파란색이지 뭐야? 도대체 뭐가 맞는 조각이야?"', onNext: () => setStep(2) });
        break;
      case 2:
        setNpcEmotion('memory');
        setDialogue({ speaker: N, text: '(바닥에 떨어진 수많은 조각 중 하나를 집어 들고, 벽화의 빈 곳을 번갈아 쳐다본다)', onNext: () => setStep(3) });
        break;
      case 3:
        setDialogue({ speaker: '조원 B', text: `"${N}아, 그거 내려놔. 섞이면 더 골치 아파져. 그냥 앉아 있어."`, onNext: () => setStep(4) });
        break;
      case 4:
        setDialogue({
          speaker: P, text: `(${N}(이)가 조각을 들고 무언가 보여주려 하고 있다...)`,
          choices: [
            { text: `🤫 "${N}아, 넌 가만히 있는 게 도와주는 거야." (배제)`, action: () => { addStat('trust', -10); setStep(40); } },
            { text: `✋ "${N}가 뭘 하려는지 한번 볼까?" (관찰)`, action: () => { logWaiting(); addStat('trust', 10); addStat('communication', 10); setStep(40); } },
            { text: `🔍 "${N}아, 이거 네가 해볼래?" (참여 유도)`, action: () => { logWaiting(); addStat('understanding', 15); addStat('trust', 10); setStep(40); } },
          ]
        });
        break;
      case 40:
        setNpcEmotion('discover');
        setDialogue({ speaker: '시스템', text: `💬 ${N}(이)가 주머니에서 PECS 카드 뭉치를 꺼냅니다. 카드를 확인하세요!` });
        setShowPecs(true);
        break;
      case 41:
        setShowPecs(false);
        setPlayerPose('talk');
        setDialogue({ speaker: P, text: '"뭐? 네가 할 수 있다고? 그래, 한번 해봐!"', onNext: () => setStep(42) });
        break;
      case 42:
        setDialogue({ speaker: '시스템', text: `🧩 ${N}(이)의 눈에는 미세한 색깔의 차이가 선명한 패턴으로 보입니다. 조각을 돌려 맞추세요!` });
        setShowMosaic(true);
        break;
      case 50:
        setShowMosaic(false);
        setNpcEmotion('happy');
        setDialogue({ speaker: P, text: `"${N}아, 네가 찾았어! 우린 다 똑같아 보였는데, 넌 이걸 어떻게 구분했어?"`, onNext: () => setStep(51) });
        break;
      case 51:
        setDialogue({ speaker: '조원 A', text: '"우와... 딱 맞네? 우린 다 똑같아 보였는데, 넌 이걸 어떻게 구별했어?"', onNext: () => setStep(52) });
        break;
      case 52:
        setDialogue({
          speaker: '시스템',
          text: `🏅 협력의 전구 획득! 남들은 구분 못하는 미세한 색깔 차이를 ${N}(이)는 단번에 알아챘어요.`,
          onNext: () => { completeStage('stage-4'); router.push('/high'); },
        });
        break;
    }
  }, [step]);

  const handlePecsComplete = () => { addStat('communication', 10); setStep(41); };
  const handleMosaicComplete = () => { logAccuracy(); useTool('pecs'); addStat('understanding', 20); addStat('trust', 20); setStep(50); };

  const npcImg = getNpcImage(state.npc.gender, npcEmotion);
  const playerImg = getPlayerImage(state.player.gender, playerPose);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <img src={BG_IMAGES.sciencelab} alt="미술시간" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)' }} />
      <div className="stage-header"><div className="stage-title">🧩 4단계: 사라진 퍼즐 조각</div><div className="stage-subtitle">강점 & 주체성</div></div>
      <div className="character-container"><div style={{ textAlign: 'center' }}><img src={playerImg} alt={P} className="character-sprite" /><div className="character-name-tag">{P}</div></div></div>
      <div style={{ position: 'absolute', bottom: 160, right: 24, textAlign: 'center', zIndex: 90 }}><img src={npcImg} alt={N} className="character-sprite" /><div className="character-name-tag">{N}</div></div>
      {showPecs && <div className="minigame-area"><PecsCardPuzzle npcName={N} onComplete={handlePecsComplete} /></div>}
      {showMosaic && <div className="minigame-area"><MosaicPuzzle onComplete={handleMosaicComplete} /></div>}
      {dialogue && <DialogueBox {...dialogue} npcName={N} playerName={P} />}
    </div>
  );
}

// ===== Stage 5: 갈림길의 기억 =====
function Stage5() {
  const { state, addStat, addInventory, useTool, logAccuracy, completeStage, logWaiting } = useGame();
  const router = useRouter();
  const N = state.npc.name;
  const P = state.player.name;
  const [step, setStep] = useState(0);
  const [dialogue, setDialogue] = useState<DialogueData | null>(null);
  const [npcEmotion, setNpcEmotion] = useState('default');
  const [playerPose, setPlayerPose] = useState('thinking');
  const [showScratch, setShowScratch] = useState(false);
  const [showFlashback, setShowFlashback] = useState(false);
  const [grayscale, setGrayscale] = useState(false);

  useEffect(() => { addInventory('map'); addInventory('ribbon'); }, []);

  useEffect(() => {
    switch (step) {
      case 0:
        setDialogue({ speaker: P, text: '"큰일 났다... 분명 아까 이쪽으로 온 것 같은데?"', onNext: () => setStep(1) });
        break;
      case 1:
        setNpcEmotion('memory');
        setDialogue({ speaker: N, text: '(제자리에 멈춰 서서 고개를 저음) "왼쪽 아님. 리본 없음."', onNext: () => setStep(2) });
        break;
      case 2:
        setDialogue({
          speaker: P, text: '"여기가 더 넓잖아! 내 감을 믿어, 빨리 와!"',
          choices: [
            { text: '🚶 승주를 억지로 끌고 왼쪽 길로 간다', action: () => { addStat('trust', -10); setStep(10); } },
            { text: `🤔 "리본? ${N}아, 아까 뭘 본 거야?" (승주를 믿는다)`, action: () => { logWaiting(); addStat('trust', 10); addStat('understanding', 10); setStep(20); } },
          ]
        });
        break;
      case 10:
        setNpcEmotion('anxious');
        setDialogue({ speaker: '시스템', text: '⛔ 막다른 길... 큰 바위가 길을 막고 있습니다.', onNext: () => setStep(11) });
        break;
      case 11:
        setDialogue({ speaker: P, text: '"...미안, 내가 틀렸어. 노란 리본이 뭐라고 했지?"', onNext: () => setStep(20) });
        break;
      case 20:
        setDialogue({ speaker: '시스템', text: `🧩 ${N}는 입구의 안내판을 사진처럼 기억하고 있습니다. ${N}의 기억을 확인해 보세요!` });
        break;
      case 30:
        setShowScratch(true);
        setDialogue({ speaker: '시스템', text: '🖐️ 안개를 문질러 지우세요! 숨겨진 노란 리본을 찾아 클릭하세요!' });
        break;
      case 40:
        setShowScratch(false);
        setNpcEmotion('happy');
        setDialogue({ speaker: N, text: '(오른쪽 덤불 숲을 가리키며) "저기. 리본. 30미터."', onNext: () => setStep(41) });
        break;
      case 41:
        setPlayerPose('talk');
        setDialogue({ speaker: P, text: `"와... 진짜네? 아까 스쳐 지나간 걸 다 기억하고 있었어? ${N}아, 네가 우리 팀 내비게이션이다!"`, onNext: () => setStep(42) });
        break;
      case 42:
        logAccuracy(); useTool('ribbon'); useTool('map');
        addStat('understanding', 20); addStat('communication', 20);
        setDialogue({
          speaker: '시스템',
          text: `🏅 기억의 나침반 획득! ${N}의 뛰어난 기억력이 길을 찾아주었어요!`,
          onNext: () => { completeStage('stage-5'); router.push('/high'); },
        });
        break;
    }
  }, [step]);

  const triggerFlashback = () => { setGrayscale(true); setShowFlashback(true); };
  const closeFlashback = () => { setGrayscale(false); setShowFlashback(false); setStep(30); };

  const npcImg = getNpcImage(state.npc.gender, npcEmotion);
  const playerImg = getPlayerImage(state.player.gender, playerPose);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }} className={grayscale ? 'scene-grayscale' : ''}>
      <img src={BG_IMAGES.crossroads} alt="갈림길" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)' }} />
      <div className="stage-header"><div className="stage-title">🌲 5단계: 갈림길의 기억</div><div className="stage-subtitle">통합 & 신뢰</div></div>
      <div className="character-container"><div style={{ textAlign: 'center' }}><img src={playerImg} alt={P} className="character-sprite" /><div className="character-name-tag">{P}</div></div></div>
      <div style={{ position: 'absolute', bottom: 160, right: 24, textAlign: 'center', zIndex: 90 }}><img src={npcImg} alt={N} className="character-sprite" /><div className="character-name-tag">{N}</div></div>

      {step === 20 && !showFlashback && (
        <div className="minigame-area" style={{ textAlign: 'center' }}>
          <button onClick={triggerFlashback} style={{
            padding: '12px 28px', background: 'rgba(30,30,60,0.85)', backdropFilter: 'blur(12px)',
            color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 16,
            fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: "'Nanum Gothic', sans-serif",
          }}>
            🕐 회상 (Flashback)
          </button>
        </div>
      )}

      {showFlashback && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9000 }}>
          <div style={{ background: 'rgba(255,255,255,0.95)', borderRadius: 20, padding: 24, maxWidth: 380, textAlign: 'center' }}>
            <p style={{ fontSize: 14, color: '#64748b', marginBottom: 8 }}>💭 {N}의 기억 속 안내 표지판</p>
            <img src={BG_IMAGES.map} alt="안내도" style={{ width: '100%', borderRadius: 12, marginBottom: 12 }} />
            <div style={{ background: '#fffbeb', border: '2px solid #fbbf24', borderRadius: 12, padding: 16, marginBottom: 12 }}>
              <p style={{ fontSize: 18, fontWeight: 800, color: '#92400e' }}>🎗️ 노란 리본을 따라가세요</p>
              <p style={{ fontSize: 14, color: '#d97706', marginTop: 4 }}>→ 오른쪽 좁은 길로 이동</p>
            </div>
            <button onClick={closeFlashback} style={{
              padding: '10px 24px', background: '#6366f1', color: 'white', borderRadius: 12,
              border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer',
            }}>현실로 돌아가기</button>
          </div>
        </div>
      )}

      {showScratch && <div className="minigame-area"><ScratchFog bgImage={BG_IMAGES.map} onComplete={() => setStep(40)} /></div>}
      {dialogue && <DialogueBox {...dialogue} npcName={N} playerName={P} />}
    </div>
  );
}

// ===== Main Stage Router =====
const STAGE_COMPONENTS = [Stage1, Stage2, Stage3, Stage4, Stage5];

export default function StagePage() {
  const params = useParams();
  const stageIndex = parseInt(params.id as string) - 1;

  if (stageIndex < 0 || stageIndex >= STAGE_COMPONENTS.length) {
    return <div style={{ color: 'white', padding: 40, textAlign: 'center' }}>잘못된 단계입니다.</div>;
  }

  const StageComponent = STAGE_COMPONENTS[stageIndex];

  return (
    <>
      <TopNavBar />
      <div className="game-area">
        <StageComponent />
      </div>
    </>
  );
}
