'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useGame } from '@/contexts/GameContext';
import TopNavBar from '@/components/layout/TopNavBar';
import DialogueBox from '@/components/game/DialogueBox';
import { getNpcImage, getPlayerImage, BG_IMAGES, ITEM_IMAGES, PEER_IMAGES, GROUP_PRESSURE_IMAGE, BADGE_IMAGES, AAC_CHOICE_IMAGES, PECS_CARD_IMAGES } from '@/data/assetMap';
import { DialogueData } from '@/types';
import StageTransition from '@/components/game/StageTransition';
import BadgePopup from '@/components/game/BadgePopup';
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
  const [showBadge, setShowBadge] = useState(false);

  useEffect(() => { addInventory('aac'); }, []);

  useEffect(() => {
    switch (step) {
      // --- 인트로: 분위기 조성 ---
      case 0:
        setPlayerPose('thinking');
        setDialogue({
          speaker: '해설', text: '(쉬는 시간. 교실은 시끌벅적하다. 아이들은 삼삼오오 모여 떠들고 있지만, 한 구석이 유독 조용하다.)',
          onNext: () => setStep(1),
        });
        break;
      case 1:
        setDialogue({
          speaker: '해설', text: `(${N}(이)가 혼자 색연필을 늘어놓고 무언가에 집중하고 있다. 입술이 조금씩 움직인다.)`,
          onNext: () => setStep(2),
        });
        break;
      // --- 선택지 ---
      case 2:
        setDialogue({
          speaker: P, text: `(어? ${N}(이)가 뭔가 말하고 있는 것 같은데... 다가가볼까?)`,
          choices: [
            { text: `"${N}아, 뭐 하고 있어?" (말 걸기)`, action: () => { addStat('communication', 5); setStep(3); } },
            { text: `조용히 옆에 앉아본다 (관찰)`, action: () => { logWaiting(); addStat('patience', 10); setStep(3); } },
          ]
        });
        break;
      // --- 반향어 ---
      case 3:
        setNpcEmotion('memory');
        setDialogue({
          speaker: N, text: `"노란색... 노란색... 노란색..."`,
          onNext: () => setStep(4),
        });
        break;
      // --- 승주 속마음 (PRD: 괄호 = 속마음) ---
      case 4:
        setDialogue({
          speaker: N, text: `(노란색 크레파스가 없어졌어. 아까 여기 있었는데. 노란색이 있어야 해.)`,
          onNext: () => setStep(5),
        });
        break;
      // --- 주변 반응 ---
      case 5:
        setDialogue({
          speaker: '옆 친구', text: '"쟤 또 저러네. 왜 맨날 혼자 중얼거려?"',
          onNext: () => setStep(6),
        });
        break;
      // --- 시스템 설명 + 핵심 선택 ---
      case 6:
        setDialogue({
          speaker: '해설', text: `${N}(이)가 **같은 말을 반복**하고 있어요. 같은 말을 반복하는 건 **무의미한 게 아니라**, 무언가를 말하려는 시도일 수 있어요.`,
          choices: [
            { text: `"${N}아, 무슨 말인지 모르겠어! 똑바로 말해!" (화남)`, action: () => { addStat('trust', -10); setStep(10); } },
            { text: `"노란색? 혹시 노란색이 필요한 거야?" (해석 시도)`, action: () => { addStat('understanding', 10); setStep(15); } },
          ]
        });
        break;
      // --- 화남 루트 ---
      case 10:
        setNpcEmotion('anxious');
        setDialogue({
          speaker: N, text: '(움츠러들며 더 작은 소리로) "노란색... 노란색..."',
          onNext: () => setStep(11),
        });
        break;
      case 11:
        setDialogue({
          speaker: N, text: '(...왜 화가 났지? 나는 그냥 노란색이 필요한데.)',
          onNext: () => setStep(12),
        });
        break;
      case 12:
        setPlayerPose('thinking');
        setDialogue({
          speaker: P, text: '(화를 내니까 더 움츠러들었어… 이러면 안 되겠다. 차분하게 도와줄 방법을 찾아보자.)',
          onNext: () => setStep(15),
        });
        break;
      // --- 소통 브릿지: AAC 도구 발견 ---
      case 15:
        setNpcEmotion('memory');
        setDialogue({
          speaker: N, text: '"노란색… 노란색…" (색연필 통을 가리키며 더 말하려 하지만, 같은 말만 반복된다)',
          onNext: () => setStep(16),
        });
        break;
      case 16:
        setPlayerPose('thinking');
        setDialogue({
          speaker: P, text: '(노란색이 필요한 건 알겠는데, 정확히 뭘 원하는지 말로는 전달이 안 돼… 다른 방법이 필요해.)',
          onNext: () => setStep(17),
        });
        break;
      case 17:
        setPlayerPose('talk');
        setDialogue({
          speaker: P, text: `(마침 교실 한쪽에 그림으로 소통할 수 있는 태블릿이 놓여 있다!) "${N}아, 잠깐만. 이걸로 보여줄 수 있을 거야!"`,
          onNext: () => setStep(20),
        });
        break;
      // --- AAC 미니게임 ---
      case 20:
        setDialogue({
          speaker: '해설', text: `**AAC(보완대체의사소통) 태블릿**으로 ${N}(이)가 말하고 싶은 것을 찾아보세요!`,
        });
        setShowMinigame(true);
        break;
      // --- 미니게임 성공 후 ---
      case 30:
        setShowMinigame(false);
        setNpcEmotion('happy');
        setDialogue({
          speaker: N, text: '(AAC(보완대체의사소통) 태블릿에서 "노란색 크레파스" 그림을 가리키며, 환하게 웃음) "노란색!"',
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
      // --- 아웃트로: 깨달음 ---
      case 32:
        setDialogue({
          speaker: P, text: '"그냥 같은 말 반복하는 줄 알았는데... 계속 말하려고 했던 거였어."',
          onNext: () => setStep(33),
        });
        break;
      case 33:
        setNpcEmotion('happy');
        setDialogue({
          speaker: '해설', text: `(${N}(이)가 노란색 크레파스를 받아들고, 조용히 웃으며 그림을 그리기 시작한다.)`,
          onNext: () => setStep(34),
        });
        break;
      case 34:
        setDialogue({
          speaker: N, text: '(이 사람은 내 말을 알아들었어. 다음에도 이 사람한테 말해봐야지.)',
          onNext: () => setStep(35),
        });
        break;
      case 35:
        setDialogue({
          speaker: '해설',
          text: `**소통의 배지** 획득! ${N}(이)가 "노란색"이라고 반복한 건 노란색 크레파스가 필요했기 때문이에요. 말이 잘 통하지 않을 때, **AAC(보완대체의사소통) 같은 도구**가 다리가 되어줄 수 있어요.`,
          onNext: () => {
            completeStage('stage-1');
            setShowBadge(true);
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
        <div className="stage-title">1단계: 앵무새의 숲</div>
        <div className="stage-subtitle">반향어 & 소통</div>
      </div>

      {showMinigame && (
        <div className="minigame-area">
          <CardPuzzle npcName={N} onComplete={handleMinigameComplete} />
        </div>
      )}

      {/* 노란 크레파스 아이템 (반향어가 의미를 드러낸 시점부터 노출) */}
      {step >= 30 && (
        <div style={{
          position: 'absolute', top: '14%', right: '5%', zIndex: 25,
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          background: 'rgba(15,23,42,0.72)', backdropFilter: 'blur(10px)',
          padding: '10px 14px', borderRadius: 16,
          border: '1px solid rgba(251,191,36,0.55)',
          boxShadow: '0 10px 26px rgba(0,0,0,0.4)',
          animation: 'fadeIn 0.6s ease',
        }}>
          <img
            src={ITEM_IMAGES.yellowCrayon}
            alt="노란 크레파스"
            style={{ width: 64, height: 64, objectFit: 'contain', filter: 'drop-shadow(0 4px 10px rgba(251,191,36,0.45))' }}
          />
          <span style={{ marginTop: 4, color: '#fde68a', fontSize: 11, fontWeight: 800 }}>노란 크레파스</span>
        </div>
      )}

      {dialogue && (
        <DialogueBox
          {...dialogue}
          npcName={N}
          playerName={P}
          characterImage={
            dialogue.speaker === P ? playerImg :
            dialogue.speaker === N ? npcImg :
            dialogue.speaker === '옆 친구' ? PEER_IMAGES.peerA_male.annoyed :
            undefined
          }
          characterPosition={dialogue.speaker === P ? 'right' : 'left'}
          // peer 스프라이트는 캔버스 대비 피사체가 작아 주요 캐릭터와 시각적 크기 통일을 위해 1.6배 확대
          characterScale={dialogue.speaker === '옆 친구' ? 1.85 : 1}
          enableTTS={false}
        />
      )}
      {showBadge && <BadgePopup badgeSrc={BADGE_IMAGES['stage-1'].src} label={BADGE_IMAGES['stage-1'].label} onClose={() => router.push('/high')} />}
    </div>
  );
}

// ===== Stage 2: 폭탄이 터졌다! =====
function Stage2() {
  const { state, addStat, addInventory, useTool, logAccuracy, completeStage, setStress, logWaiting } = useGame();
  const router = useRouter();
  const N = state.npc.name;
  const P = state.player.name;
  const [showBadge, setShowBadge] = useState(false);
  const [step, setStep] = useState(0);
  const [dialogue, setDialogue] = useState<DialogueData | null>(null);
  const [npcEmotion, setNpcEmotion] = useState('anxious');
  const [playerPose, setPlayerPose] = useState('thinking');
  const [showMinigame, setShowMinigame] = useState(false);
  const [vignetteRed, setVignetteRed] = useState(false);

  useEffect(() => { addInventory('headset'); }, []);

  useEffect(() => {
    switch (step) {
      // --- 인트로: 급식실 분위기 ---
      case 0:
        setDialogue({
          speaker: '해설', text: '(점심시간. 급식실이 소란스럽다. 숟가락 부딪히는 소리, 웃음소리, 의자 끄는 소리가 뒤섞여 울린다.)',
          onNext: () => setStep(1),
        });
        break;
      case 1:
        setDialogue({
          speaker: '해설', text: `(${N}(이)가 밥을 안 먹고 숟가락을 딱딱거리고 있다. 눈을 질끈 감고 있다.)`,
          onNext: () => setStep(2),
        });
        break;
      // --- 승주 속마음 ---
      case 2:
        setNpcEmotion('anxious');
        setDialogue({
          speaker: N, text: '(시끄러워. 시끄러워. 머리가 아파. 여기서 나가고 싶어.)',
          onNext: () => setStep(3),
        });
        break;
      // --- 선택지 ---
      case 3:
        setPlayerPose('thinking');
        setDialogue({
          speaker: P, text: `(${N} 표정이 안 좋은데... 밥도 안 먹고 숟가락을 딱딱거리고 있어. 왜 저러지?)`,
          choices: [
            { text: '"밥 안 먹어? 빨리 먹어." (재촉)', action: () => setStep(4) },
            { text: '"어디 아파?" (질문)', action: () => { addStat('understanding', 5); setStep(4); } },
            { text: '주변 소음을 유심히 들어본다 (관찰)', action: () => { addStat('understanding', 10); logWaiting(); setStep(4); } },
          ]
        });
        break;
      // --- 사건 발생 ---
      case 4:
        setDialogue({ speaker: '해설', text: '**쨍그랑!** 옆 테이블에서 누군가 식판을 떨어뜨렸습니다!', onNext: () => setStep(5) });
        break;
      // --- 승주 속마음: 공포 ---
      case 5:
        setDialogue({
          speaker: N, text: '(!! 아파아파아파!! 귀가 찢어지는 것 같아!! 도망가야 해!!)',
          onNext: () => setStep(6),
        });
        break;
      case 6:
        setNpcEmotion('pain'); setVignetteRed(true);
        setDialogue({ speaker: N, text: '"으아아악!! 멈춰!! 멈춰!!" (귀를 막으며 옆에 있던 나를 밀침)', onNext: () => setStep(7) });
        break;
      case 7:
        setPlayerPose('surprised');
        setDialogue({
          speaker: P, text: `(밀쳐져서 엉덩방아를 찧음) "...진짜 아프다. 왜 나를 밀친 거야?"`,
          choices: [
            { text: '"너 미쳤어? 왜 사람을 때려!" (같이 화냄)', action: () => { addStat('trust', -15); setStress(80); setStep(10); } },
            { text: '선생님을 부르러 뛰어간다 (회피)', action: () => { addStat('patience', 5); setStep(20); } },
            { text: `${N}의 상태(귀를 막고 있음)를 확인한다`, action: () => { logWaiting(); addStat('understanding', 10); addStat('patience', 10); setStep(30); } },
          ]
        });
        break;
      // --- 화냄 루트 ---
      case 10:
        setNpcEmotion('pain');
        setDialogue({ speaker: N, text: '(더 크게 소리질러 귀를 막음) "아악!! 시끄러워!!"', onNext: () => setStep(11) });
        break;
      case 11:
        setPlayerPose('thinking');
        setDialogue({
          speaker: P, text: '(같이 소리를 지르니까 더 심해졌어… 이건 화가 나서 그런 게 아니야. 진짜 아파하고 있어.)',
          onNext: () => setStep(35),
        });
        break;
      // --- 회피 루트 ---
      case 20:
        setDialogue({ speaker: '해설', text: '선생님이 오시기까지 시간이 걸립니다. 그 사이에도 소음은 계속…', onNext: () => setStep(21) });
        break;
      case 21:
        setPlayerPose('thinking');
        setDialogue({
          speaker: P, text: `(선생님을 기다리는 동안에도 ${N}(이)는 계속 귀를 막고 웅크려 있어… 지금 당장 뭔가 해줘야 해.)`,
          onNext: () => setStep(35),
        });
        break;
      // --- 관찰 루트 ---
      case 30:
        setDialogue({ speaker: '해설', text: `${N}(이)가 양쪽 귀를 꽉 막고 있는 것이 보입니다. 소리 때문에 **고통받고** 있어요!`, onNext: () => setStep(35) });
        break;
      // --- 공통 브릿지: 헤드셋 발견 ---
      case 35:
        setPlayerPose('thinking');
        setDialogue({
          speaker: P, text: '(귀를 막고 있어… 소리가 너무 크게 들리는 거구나. 소음을 줄여줄 수 있는 게 없을까?)',
          onNext: () => setStep(36),
        });
        break;
      case 36:
        setPlayerPose('talk');
        setDialogue({
          speaker: P, text: `(맞다, 가방에 담임 선생님이 넣어 주신 헤드셋이 있었지!) "${N}아, 잠깐만!"`,
          onNext: () => setStep(40),
        });
        break;
      // --- 미니게임 ---
      case 40:
        setDialogue({ speaker: '해설', text: `**노이즈 캔슬링 헤드셋**의 다이얼을 조절해 소음을 줄여 주세요!` });
        setShowMinigame(true);
        break;
      // --- 미니게임 성공 후 ---
      case 50:
        setShowMinigame(false); setVignetteRed(false);
        setNpcEmotion('calm');
        setDialogue({ speaker: '해설', text: '헤드셋 착용! 시끄러운 소음이 사라지고... 고요해졌어요.', onNext: () => setStep(51) });
        break;
      case 51:
        setDialogue({ speaker: N, text: '(거친 숨을 몰아쉬다가 진정함) "...아파. 소리. 아파."', onNext: () => setStep(52) });
        break;
      // --- 승주 속마음: 사과하고 싶음 ---
      case 52:
        setDialogue({
          speaker: N, text: '(미안해. 밀치려던 게 아니야. 몸이 먼저 움직였어. 너한테 사과하고 싶은데 어떻게 말해야 하는지 모르겠어.)',
          onNext: () => setStep(53),
        });
        break;
      // --- 아웃트로: 깨달음 ---
      case 53:
        setPlayerPose('talk');
        setDialogue({ speaker: P, text: '"나를 때리려던 게 아니었구나. 소리가 너무 아파서... 도망치려던 거였어."', onNext: () => setStep(54) });
        break;
      case 54:
        setDialogue({ speaker: P, text: `"나한테는 그냥 좀 시끄러운 소리였는데, ${N}(이)한테는 **완전히 다른 크기**로 들리는 거구나."`, onNext: () => setStep(55) });
        break;
      case 55:
        setNpcEmotion('happy');
        setDialogue({
          speaker: '해설',
          text: `**배려의 방패** 획득! **감각 과민**이 있는 친구에게는 우리가 견딜 수 있는 소리도 고통이 될 수 있어요. 갑자기 밀치거나 소리 지르는 건 **공격이 아니라 자기 방어**예요.`,
          onNext: () => { completeStage('stage-2'); setShowBadge(true); },
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
        <div className="stage-title">2단계: 폭탄이 터졌다!</div>
        <div className="stage-subtitle">감각 과부하 & 조절</div>
      </div>

      {showMinigame && <div className="minigame-area"><WaveformSlider onComplete={handleMinigameComplete} /></div>}
      {dialogue && (
        <DialogueBox 
          {...dialogue} 
          npcName={N} 
          playerName={P} 
          characterImage={dialogue.speaker === P ? playerImg : dialogue.speaker === N ? npcImg : undefined}
          characterPosition={dialogue.speaker === P ? 'right' : 'left'}
          enableTTS={false}
        />
      )}
      {showBadge && <BadgePopup badgeSrc={BADGE_IMAGES['stage-2'].src} label={BADGE_IMAGES['stage-2'].label} onClose={() => router.push('/high')} />}
    </div>
  );
}

// ===== Stage 3: 기차는 멈추지 않아 =====
function Stage3() {
  const { state, addStat, addInventory, useTool, logAccuracy, completeStage, logWaiting } = useGame();
  const router = useRouter();
  const N = state.npc.name;
  const P = state.player.name;
  const [showBadge, setShowBadge] = useState(false);
  const [step, setStep] = useState(0);
  const [dialogue, setDialogue] = useState<DialogueData | null>(null);
  const [npcEmotion, setNpcEmotion] = useState('happy');
  const [playerPose, setPlayerPose] = useState('talk');
  const [showDial, setShowDial] = useState(false);
  const [showSquishy, setShowSquishy] = useState(false);

  useEffect(() => { addInventory('timer'); }, []);

  useEffect(() => {
    switch (step) {
      // --- 인트로 ---
      case 0:
        setDialogue({
          speaker: '해설', text: `(점심시간이 끝나간다. 운동장 한쪽에서 ${N}(이)가 바닥에 뭔가를 열심히 그리고 있다.)`,
          onNext: () => setStep(1),
        });
        break;
      case 1:
        setPlayerPose('thinking');
        setDialogue({
          speaker: P, text: '(또 지하철 그리고 있네. 매일 저것만 그린다. 종이 쳤는데 어떡하지?)',
          onNext: () => setStep(2),
        });
        break;
      case 2:
        setNpcEmotion('happy');
        setDialogue({ speaker: N, text: '"여기는 사당역. 환승입니다. **2호선** 띠리리링~" (손가락으로 선로를 따라가며 매우 행복한 표정)', onNext: () => setStep(3) });
        break;
      // --- 승주 속마음: 특별 관심사 ---
      case 3:
        setDialogue({
          speaker: N, text: '(지하철 노선은 완벽해. 모든 역이 순서대로 연결되어 있어. 이 세상에서 가장 안전한 규칙이야.)',
          onNext: () => setStep(4),
        });
        break;
      // --- 선택지 ---
      case 4:
        setDialogue({
          speaker: '해설', text: `점심시간이 끝났는데 ${N}(이)가 운동장 바닥에 그림을 그리고 있습니다.`,
          choices: [
            { text: '"야, 종 쳤어! 가자!" (잡아끈다)', action: () => { addStat('trust', -10); setStep(10); } },
            { text: `"우와, 이거 지하철 노선도야?"`, action: () => { logWaiting(); addStat('trust', 10); setStep(20); } },
          ]
        });
        break;
      // --- 잡아끌기 루트 ---
      case 10:
        setNpcEmotion('pain');
        setDialogue({ speaker: N, text: '(바닥에 드러누우며) "안 가!! 기차 출발 안 했어!!"', onNext: () => setStep(11) });
        break;
      case 11:
        setDialogue({
          speaker: N, text: '(지금은 안 돼! 아직 4호선을 안 그렸어! 끝나지 않은 건 안 돼!)',
          onNext: () => setStep(12),
        });
        break;
      case 12:
        setPlayerPose('thinking');
        setDialogue({
          speaker: P, text: '(잡아끄니까 오히려 더 심해졌어… 억지로는 안 되겠다. 다른 방법이 필요해.)',
          onNext: () => setStep(30),
        });
        break;
      // --- 관심 표현 루트 ---
      case 20:
        setNpcEmotion('memory');
        setDialogue({ speaker: N, text: '(눈이 반짝이며) "사당역 다음은 낙성대. 그 다음은 **서울대입구**. 그 다음은..."', onNext: () => setStep(21) });
        break;
      case 21:
        setPlayerPose('talk');
        setDialogue({ speaker: P, text: '"와, 이거 진짜 정확해. 역 이름을 다 외우고 있어?"', onNext: () => setStep(22) });
        break;
      case 22:
        setDialogue({
          speaker: N, text: '(이 사람이 내 지하철에 관심이 있어! 보여주고 싶어!)',
          onNext: () => setStep(23),
        });
        break;
      // --- 교실 전이 브릿지 (Route B) ---
      case 23:
        setPlayerPose('talk');
        setDialogue({
          speaker: P, text: `"${N}아, 이거 정말 대단하다. 근데 종이 벌써 쳤어. 우리 교실로 들어가야 해."`,
          onNext: () => setStep(24),
        });
        break;
      case 24:
        setNpcEmotion('anxious');
        setDialogue({
          speaker: N, text: '"안 돼! 아직 4호선 안 그렸어. 여기 이거 끝내야 돼!" (바닥에 붙어서 떨어지지 않는다)',
          onNext: () => setStep(25),
        });
        break;
      case 25:
        setDialogue({
          speaker: N, text: '(끝나지 않은 건 안 돼. 4호선까지 다 그려야 하는데… 왜 멈추래?)',
          onNext: () => setStep(26),
        });
        break;
      case 26:
        setPlayerPose('thinking');
        setDialogue({
          speaker: P, text: '(말로만 하니까 불안해하네… 끝나는 시간이 눈에 "보이게" 해 주면 어떨까?)',
          onNext: () => setStep(30),
        });
        break;
      // --- 타이머 설명 → 미니게임 ---
      case 30:
        setPlayerPose('talk');
        setDialogue({
          speaker: P, text: `"${N}아, 여기 봐. 이 빨간색이 줄어들어서 다 사라지면, 기차는 '교실역'으로 출발하는 거야."`,
          onNext: () => setStep(31),
        });
        break;
      case 31:
        setDialogue({ speaker: '해설', text: '**비주얼 타이머**로 눈에 보이는 약속을 만들어 주세요!' });
        setShowDial(true);
        break;
      // --- 타이머 반응: 시각적 안심, 그러나 신체 불안 ---
      case 40:
        setShowDial(false);
        setNpcEmotion('calm');
        setDialogue({
          speaker: N, text: '"…빨간색이 줄어들고 있어. 끝나는 게 보여." (타이머를 뚫어지게 쳐다본다)',
          onNext: () => setStep(41),
        });
        break;
      case 41:
        setNpcEmotion('anxious');
        setDialogue({
          speaker: N, text: '"근데… 아직 많이 남았어. 으으으…" (손톱을 물어뜯으며 다리를 떤다)',
          onNext: () => setStep(42),
        });
        break;
      // --- 승주 속마음: 시각은 안심, 몸은 불안 ---
      case 42:
        setDialogue({
          speaker: N, text: '(끝나는 건 보여서 조금 나아. 근데 몸이 가만히 있질 못해. 손이 근질근질해.)',
          onNext: () => setStep(43),
        });
        break;
      // --- 말랑이 브릿지: 관찰 → 주머니에서 꺼냄 ---
      case 43:
        setPlayerPose('thinking');
        setDialogue({
          speaker: P, text: `(타이머 덕분에 좀 나아진 것 같긴 한데, 몸은 여전히 불안해 보여… 손을 자꾸 물어뜯고 있어.)`,
          onNext: () => setStep(44),
        });
        break;
      case 44:
        setPlayerPose('talk');
        addInventory('squishy');
        setDialogue({
          speaker: P, text: `"${N}아, 마침 주머니에 이게 있는데. 한번 쥐어 봐." (주머니에서 말랑이를 꺼내 건넨다)`,
          onNext: () => setStep(45),
        });
        break;
      // --- 말랑이 미니게임 ---
      case 45:
        setDialogue({ speaker: '해설', text: '손에 쥐고 천천히 누르면 마음이 편해져요. **말랑이**를 눌러 보세요!' });
        setShowSquishy(true);
        break;
      // --- 성공 후 ---
      case 50:
        setShowSquishy(false);
        setNpcEmotion('happy');
        setDialogue({ speaker: N, text: '(타이머 종료. 차분하게 일어남) "종점. 교실역. 출발."', onNext: () => setStep(51) });
        break;
      case 51:
        setPlayerPose('talk');
        setDialogue({ speaker: P, text: `"${N}아, 너 이 노선도 다 그렸으니까 내일은 **3호선**도 그려볼래?"`, onNext: () => setStep(52) });
        break;
      // --- 승주 속마음: 기쁨 ---
      case 52:
        setDialogue({
          speaker: N, text: '(3호선! 좋아! 내일도 이 사람이랑 같이 그리고 싶어.)',
          onNext: () => setStep(53),
        });
        break;
      // --- 뱃지 ---
      case 53:
        setDialogue({
          speaker: '해설',
          text: '**약속의 시계** 획득! 갑작스러운 변화가 힘든 친구에게는 **미리 준비할 시간**과 **눈에 보이는 약속**(타이머)이 효과적이에요. 그리고 친구의 **특별한 관심사**를 존중해주세요.',
          onNext: () => { completeStage('stage-3'); setShowBadge(true); },
        });
        break;
    }
  }, [step]);

  const handleDialComplete = () => { logAccuracy(); useTool('timer'); addStat('communication', 20); addStat('patience', 20); setStep(40); };
  const handleSquishyComplete = () => { useTool('squishy'); addStat('patience', 10); addStat('trust', 10); setStep(50); };

  const npcImg = getNpcImage(state.npc.gender, npcEmotion);
  const playerImg = getPlayerImage(state.player.gender, playerPose);

  // 모래에 그린 지하철 노선도 장면은 인트로~관심 표현 구간(step ≤ 22)에서 배경으로 노출.
  // 그 이후에는 일반 운동장 배경으로 자연스럽게 전환.
  // 인트로~브릿지 구간(step < 30)은 모래 노선도 배경, 타이머 이후는 운동장 전경
  const stage3Bg = step < 30 ? BG_IMAGES.sandPlayground : BG_IMAGES.playground;

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <img src={stage3Bg} alt="운동장" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)' }} />
      <div className="stage-header"><div className="stage-title">3단계: 기차는 멈추지 않아</div><div className="stage-subtitle">전이 & 감각 조절</div></div>

      {showDial && <div className="minigame-area"><TimerDial onComplete={handleDialComplete} /></div>}
      {showSquishy && <div className="minigame-area"><SquishyBreath onComplete={handleSquishyComplete} /></div>}
      {dialogue && (
        <DialogueBox
          {...dialogue}
          npcName={N}
          playerName={P}
          characterImage={dialogue.speaker === P ? playerImg : dialogue.speaker === N ? npcImg : undefined}
          characterPosition={dialogue.speaker === P ? 'right' : 'left'}
          enableTTS={false}
        />
      )}
      {showBadge && <BadgePopup badgeSrc={BADGE_IMAGES['stage-3'].src} label={BADGE_IMAGES['stage-3'].label} onClose={() => router.push('/high')} />}
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
  const [showBadge, setShowBadge] = useState(false);
  const [showMosaic, setShowMosaic] = useState(false);

  useEffect(() => { addInventory('pecs'); }, []);

  useEffect(() => {
    switch (step) {
      // --- 인트로: 미술 시간 분위기 ---
      case 0:
        setDialogue({
          speaker: '해설', text: '(미술 시간. 학급 전체가 거대한 모자이크 벽화를 만들고 있다. 마감이 코앞인데 마지막 하늘 부분이 안 맞는다.)',
          onNext: () => setStep(1),
        });
        break;
      case 1:
        setDialogue({ speaker: '조원 A', text: '"이 파란색 조각들 다 똑같아 보이는데? 도대체 어떤 걸 넣어야 하는 거야?"', onNext: () => setStep(2) });
        break;
      case 2:
        setDialogue({ speaker: '조원 B', text: '"시간 없어, 빨리빨리 해야지! 아무거나 넣자."', onNext: () => setStep(3) });
        break;
      // --- 승주의 행동 ---
      case 3:
        setNpcEmotion('memory');
        setDialogue({ speaker: '해설', text: `(${N}(이)가 바닥에 흩어진 조각들 사이에서 하나를 집어들고, 벽화의 빈 곳을 번갈아 쳐다본다.)`, onNext: () => setStep(4) });
        break;
      // --- 승주 속마음 ---
      case 4:
        setDialogue({
          speaker: N, text: '(이건 아니야. 이 파란색은 0.3톤 더 밝아. 맞는 건... 저기 있어.)',
          onNext: () => setStep(5),
        });
        break;
      // --- 배제 ---
      case 5:
        setDialogue({ speaker: '조원 B', text: `"${N}아, 그거 내려놔. 섞이면 더 골치 아파져. 그냥 **앉아 있어**."`, onNext: () => setStep(6) });
        break;
      // --- 승주 속마음: 슬픔 ---
      case 6:
        setDialogue({
          speaker: N, text: '(...앉아 있으라고? 나는 맞는 조각을 찾았는데. 왜 아무도 안 봐?)',
          onNext: () => setStep(7),
        });
        break;
      // --- 핵심 선택 ---
      case 7:
        setPlayerPose('thinking');
        setDialogue({
          speaker: P, text: `(${N}(이)가 조각을 들고 무언가 보여주려 하고 있다...)`,
          choices: [
            { text: `"${N}아, 넌 가만히 있는 게 도와주는 거야." (배제)`, action: () => { addStat('trust', -10); setStep(8); } },
            { text: `"${N}(이)가 뭘 하려는지 한번 볼까?" (관찰)`, action: () => { logWaiting(); addStat('trust', 10); addStat('communication', 10); setStep(15); } },
            { text: `"${N}아, 이거 네가 해볼래?" (참여 유도)`, action: () => { logWaiting(); addStat('understanding', 15); addStat('trust', 10); setStep(40); } },
          ]
        });
        break;
      // --- 배제 브릿지: 승주의 의지 ---
      case 8:
        setDialogue({
          speaker: N, text: '(…앉아 있으라고? 하지만 나는 이 조각이 맞다는 걸 알아. 포기할 수 없어.)',
          onNext: () => setStep(9),
        });
        break;
      case 9:
        setDialogue({
          speaker: '해설', text: `그런데 ${N}(이)가 조용히 자리에서 일어나 주머니를 뒤지기 시작합니다.`,
          onNext: () => setStep(40),
        });
        break;
      // --- 관찰 브릿지 ---
      case 15:
        setPlayerPose('thinking');
        setDialogue({
          speaker: P, text: `(조용히 지켜본다. ${N}(이)가 뭔가 보여주려고 하고 있어… 기다려 보자.)`,
          onNext: () => setStep(40),
        });
        break;
      // --- PECS 미니게임 ---
      case 40:
        setNpcEmotion('discover');
        setDialogue({ speaker: '해설', text: `${N}(이)가 주머니에서 **의사소통 카드** 뭉치를 꺼냅니다. 카드를 확인하세요!` });
        setShowPecs(true);
        break;
      case 41:
        setShowPecs(false);
        setPlayerPose('talk');
        setDialogue({ speaker: P, text: '"뭐? 네가 할 수 있다고? 그래, 한번 해봐!"', onNext: () => setStep(42) });
        break;
      // --- 모자이크 미니게임 ---
      case 42:
        setDialogue({ speaker: '해설', text: `${N}(이)의 눈에는 미세한 색깔의 차이가 선명한 패턴으로 보입니다. 조각을 돌려 맞추세요!` });
        setShowMosaic(true);
        break;
      // --- 성공 후: 반응 ---
      case 50:
        setShowMosaic(false);
        setNpcEmotion('happy');
        setDialogue({ speaker: '조원 A', text: '"우와... **딱 맞네?** 어떻게 이걸 구별했어? 나한테는 다 똑같아 보였는데."', onNext: () => setStep(51) });
        break;
      case 51:
        setPlayerPose('talk');
        setDialogue({ speaker: P, text: '"아까 앉아 있으라고 했을 때... 이미 답을 알고 있었구나."', onNext: () => setStep(52) });
        break;
      // --- 승주 속마음: 기쁨 ---
      case 52:
        setDialogue({
          speaker: N, text: '(내가 도움이 됐어! 내가 찾은 조각이 맞았어!)',
          onNext: () => setStep(53),
        });
        break;
      // --- 조원 사과 ---
      case 53:
        setDialogue({ speaker: '조원 B', text: `"...미안. 아까 가만히 있으라고 해서. 다음에는 ${N}(이)한테 먼저 물어볼게."`, onNext: () => setStep(54) });
        break;
      // --- 뱃지 ---
      case 54:
        setDialogue({
          speaker: '해설',
          text: `**강점의 전구** 획득! ${N}(이)는 남들이 보지 못하는 **미세한 차이**를 알아채는 뛰어난 눈을 가지고 있어요. **"못하는 것"만 보면 "잘하는 것"을 놓치게 돼요.**`,
          onNext: () => { completeStage('stage-4'); setShowBadge(true); },
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
      <div className="stage-header"><div className="stage-title">4단계: 사라진 퍼즐 조각</div><div className="stage-subtitle">강점 & 주체성</div></div>
      {showPecs && <div className="minigame-area"><PecsCardPuzzle npcName={N} onComplete={handlePecsComplete} /></div>}
      {showMosaic && <div className="minigame-area"><MosaicPuzzle onComplete={handleMosaicComplete} /></div>}
      {dialogue && (
        <DialogueBox
          {...dialogue}
          npcName={N}
          playerName={P}
          characterImage={
            dialogue.speaker === P ? playerImg :
            dialogue.speaker === N ? npcImg :
            // 조원 A (남): 결말 이후에는 미안/감탄(=sorry 포즈), 그 전에는 짜증
            dialogue.speaker === '조원 A'
              ? (step >= 50 ? PEER_IMAGES.peerA_male.sorry : PEER_IMAGES.peerA_male.annoyed)
              :
            // 조원 B (여): 사과 단계(53) 이후에는 기본, 그 전에는 짜증
            dialogue.speaker === '조원 B'
              ? (step >= 53 ? PEER_IMAGES.peerB_female.default : PEER_IMAGES.peerB_female.annoyed)
              :
            undefined
          }
          characterPosition={dialogue.speaker === P ? 'right' : 'left'}
          // peer 스프라이트 크기 보정
          characterScale={
            dialogue.speaker === '조원 A' || dialogue.speaker === '조원 B' ? 1.85 : 1
          }
          enableTTS={false}
        />
      )}
      {showBadge && <BadgePopup badgeSrc={BADGE_IMAGES['stage-4'].src} label={BADGE_IMAGES['stage-4'].label} onClose={() => router.push('/high')} />}
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
  const [showBadge, setShowBadge] = useState(false);
  const [playerPose, setPlayerPose] = useState('thinking');
  const [showScratch, setShowScratch] = useState(false);
  const [showFlashback, setShowFlashback] = useState(false);
  const [grayscale, setGrayscale] = useState(false);

  useEffect(() => { addInventory('map'); addInventory('ribbon'); }, []);

  useEffect(() => {
    switch (step) {
      // --- 인트로 내레이션 ---
      case 0:
        setDialogue({ speaker: '해설', text: '숲 체험학습 도중, 갑자기 안개가 짙어졌습니다. 앞이 잘 보이지 않는 가운데, 길이 둘로 갈라집니다.', onNext: () => setStep(1) });
        break;
      case 1:
        setDialogue({ speaker: '해설', text: '왼쪽은 넓고 평탄해 보이고, 오른쪽은 좁고 덤불이 우거져 있습니다. 대부분의 친구들이 왼쪽을 가리킵니다.', onNext: () => setStep(2) });
        break;
      case 2:
        setDialogue({ speaker: P, text: '"큰일 났다... 분명 아까 이쪽으로 온 것 같은데? 왼쪽이 더 넓으니까 왼쪽 아닐까?"', onNext: () => setStep(3) });
        break;
      // --- 승주 속마음: 사진 같은 기억 ---
      case 3:
        setNpcEmotion('memory');
        setDialogue({ speaker: N, text: '(입구 안내판에 적혀 있었어. "노란 리본을 따라가세요." 왼쪽에는 리본이 없었어. 확실해.)', onNext: () => setStep(4) });
        break;
      case 4:
        setDialogue({ speaker: N, text: '(제자리에 멈춰 서서 고개를 저음) "왼쪽 아님. 리본 없음. 오른쪽."', onNext: () => setStep(5) });
        break;
      // --- 또래 압박 ---
      case 5:
        setDialogue({ speaker: '친구들', text: '"에이, 아무도 안 가는 좁은 길로 가자고? 넓은 쪽이 맞을 것 같은데..."', onNext: () => setStep(6) });
        break;
      // --- 선택 ---
      case 6:
        setPlayerPose('thinking');
        setDialogue({
          speaker: P, text: '"다들 왼쪽이라는데... 근데 아까 리본을 봤다고?"',
          choices: [
            { text: '다수를 따라 왼쪽 길로 간다', action: () => { addStat('trust', -10); setStep(10); } },
            { text: `"${N}아, 네가 본 리본 이야기 좀 더 해줘" (승주를 믿는다)`, action: () => { logWaiting(); addStat('trust', 10); addStat('understanding', 10); setStep(20); } },
          ]
        });
        break;
      // --- 오답 루트 ---
      case 10:
        setNpcEmotion('anxious');
        setDialogue({ speaker: '해설', text: '막다른 길... 큰 바위가 길을 막고 있습니다. 되돌아가야 합니다.', onNext: () => setStep(11) });
        break;
      case 11:
        setDialogue({ speaker: P, text: '"(아... 많은 사람이 맞다고 한 쪽이 아니었어. 나는 다수의 의견만 따르고, 직접 관찰한 사람의 말은 무시했구나.)"', onNext: () => setStep(12) });
        break;
      case 12:
        setDialogue({ speaker: P, text: `"...미안, 내가 틀렸어. ${N}아, 네가 말한 노란 리본 이야기, 다시 해줄래?"`, onNext: () => setStep(20) });
        break;
      // --- 신뢰 루트: 회상 ---
      case 20:
        setDialogue({ speaker: '해설', text: `${N}는 입구의 안내판을 **사진처럼 정확하게** 기억하고 있습니다. ${N}의 기억 속으로 들어가 보세요!` });
        break;
      case 25:
        setNpcEmotion('memory');
        setDialogue({ speaker: N, text: '(안내판. 글자 12개. "노란 리본을 따라가세요." 오른쪽 화살표. 리본 그림 3개. 전부 기억나. 틀릴 리가 없어.)', onNext: () => setStep(30) });
        break;
      // --- 스크래치 미니게임 ---
      case 30:
        setShowScratch(true);
        setDialogue({ speaker: '해설', text: '안개를 문질러 지우세요! 숨겨진 노란 리본을 찾아 클릭하세요!' });
        break;
      case 40:
        setShowScratch(false);
        setNpcEmotion('happy');
        setDialogue({ speaker: N, text: '(오른쪽 덤불 숲을 가리키며) "저기. 리본. 30미터."', onNext: () => setStep(41) });
        break;
      // --- 승주 속마음: 신뢰의 기쁨 ---
      case 41:
        setDialogue({ speaker: N, text: '(맞았어! 내 기억이 맞았어! 이 사람은... 내 말을 믿어줬어. 처음이야.)', onNext: () => setStep(42) });
        break;
      case 42:
        setPlayerPose('talk');
        setDialogue({ speaker: P, text: `"와... 진짜네? 아까 스쳐 지나간 걸 다 기억하고 있었어? ${N}아, 네가 우리 팀 내비게이션이다!"`, onNext: () => setStep(43) });
        break;
      // --- 깨달음 ---
      case 43:
        setDialogue({ speaker: P, text: `"다수가 왼쪽이라고 했을 때, ${N}(이)만 달랐어. 근데 정답은 ${N}(이)었어. **다르다는 건 틀린 게 아니었어.**"`, onNext: () => setStep(44) });
        break;
      // --- 배지 ---
      case 44:
        logAccuracy(); useTool('ribbon'); useTool('map');
        addStat('understanding', 20); addStat('communication', 20);
        setDialogue({
          speaker: '해설',
          text: `**신뢰의 리본** 획득! ${N}의 뛰어난 기억력이 길을 찾아주었어요. 누군가의 **다른 방식**을 믿는 것, 그것이 진짜 신뢰예요.`,
          onNext: () => { completeStage('stage-5'); setShowBadge(true); },
        });
        break;
    }
  }, [step]);

  const triggerFlashback = () => { setGrayscale(true); setShowFlashback(true); };
  const closeFlashback = () => { setGrayscale(false); setShowFlashback(false); setStep(25); };

  const npcImg = getNpcImage(state.npc.gender, npcEmotion);
  const playerImg = getPlayerImage(state.player.gender, playerPose);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }} className={grayscale ? 'scene-grayscale' : ''}>
      {/* 동적 배경: 인트로(안개숲) → 선택/회상(갈림길) → 오답 루트(막다른길) */}
      <img
        src={
          step <= 2 ? BG_IMAGES.foggyForest :
          (step >= 10 && step <= 12) ? BG_IMAGES.deadEnd :
          BG_IMAGES.crossroads
        }
        alt="갈림길"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
      />
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)' }} />
      <div className="stage-header"><div className="stage-title">5단계: 갈림길의 기억</div><div className="stage-subtitle">통합 & 신뢰</div></div>

      {step === 20 && !showFlashback && (
        <div className="minigame-area" style={{ textAlign: 'center' }}>
          <button onClick={triggerFlashback} style={{
            padding: '12px 28px', background: 'rgba(30,30,60,0.85)', backdropFilter: 'blur(12px)',
            color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 16,
            fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: "'Nanum Gothic', sans-serif",
          }}>
            회상 (Flashback)
          </button>
        </div>
      )}

      {showFlashback && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9000 }}>
          <div style={{ background: 'rgba(255,255,255,0.95)', borderRadius: 20, padding: 24, maxWidth: 380, textAlign: 'center' }}>
            <p style={{ fontSize: 14, color: '#64748b', marginBottom: 8 }}>{N}의 기억 속 안내 표지판</p>
            <img src={BG_IMAGES.map} alt="안내도" style={{ width: '100%', borderRadius: 12, marginBottom: 12 }} />
            <div style={{ background: '#fffbeb', border: '2px solid #fbbf24', borderRadius: 12, padding: 16, marginBottom: 12 }}>
              <p style={{ fontSize: 18, fontWeight: 800, color: '#92400e' }}>노란 리본을 따라가세요</p>
              <p style={{ fontSize: 14, color: '#d97706', marginTop: 4 }}>→ 오른쪽 좁은 길로 이동</p>
            </div>
            <button onClick={closeFlashback} style={{
              padding: '10px 24px', background: '#6366f1', color: 'white', borderRadius: 12,
              border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer',
            }}>현실로 돌아가기</button>
          </div>
        </div>
      )}

      {showScratch && <div className="minigame-area"><ScratchFog bgImage={BG_IMAGES.map} ribbonImage={ITEM_IMAGES.ribbon} onComplete={() => setStep(40)} /></div>}

      {dialogue && (
        <DialogueBox
          {...dialogue}
          npcName={N}
          playerName={P}
          characterImage={
            dialogue.speaker === P ? playerImg :
            dialogue.speaker === N ? npcImg :
            // 다수결 압박을 표현하는 친구 무리 그림
            dialogue.speaker === '친구들' ? GROUP_PRESSURE_IMAGE :
            undefined
          }
          characterPosition={dialogue.speaker === P ? 'right' : 'left'}
          // 친구 무리 이미지는 3~4명이 찍혀 있어 더 크게 확대
          characterScale={dialogue.speaker === '친구들' ? 1.95 : 1}
          enableTTS={false}
        />
      )}
      {showBadge && <BadgePopup badgeSrc={BADGE_IMAGES['stage-5'].src} label={BADGE_IMAGES['stage-5'].label} onClose={() => router.push('/high')} />}
    </div>
  );
}

// ===== Main Stage Router =====
const STAGE_COMPONENTS = [Stage1, Stage2, Stage3, Stage4, Stage5];

export default function StagePage() {
  const params = useParams();
  const { startStage } = useGame();
  const stageIndex = parseInt(params.id as string) - 1;
  const isValid = stageIndex >= 0 && stageIndex < STAGE_COMPONENTS.length;

  // 단계에 들어온 순간 교사 대시보드에 "진행 중"으로 표시
  useEffect(() => {
    if (isValid) startStage(`stage-${stageIndex + 1}`);
  }, [isValid, stageIndex, startStage]);

  if (!isValid) {
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
