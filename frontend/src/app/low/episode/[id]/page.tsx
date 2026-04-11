'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useGame } from '@/contexts/GameContext';
import TopNavBar from '@/components/layout/TopNavBar';
import { getLowNpcImage, LOW_BG_IMAGES, ITEM_IMAGES } from '@/data/assetMap';
import Icon from '@/components/ui/Icon';
import ParticleCanvas from '@/components/minigames/ParticleCanvas';
import { useTTS } from '@/hooks/useTTS';

// Hook to track container dimensions for ParticleCanvas
function useContainerSize(ref: React.RefObject<HTMLDivElement | null>) {
  const [size, setSize] = useState({ width: 800, height: 600 });
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([entry]) => {
      setSize({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, [ref]);
  return size;
}

// ===== Low Stage 1: 먼저 물어봐주기 =====
function LowStage1() {
  const { state, completeStage, addHeart } = useGame();
  const router = useRouter();
  const [isComplete, setIsComplete] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { width, height } = useContainerSize(containerRef);

  const handleTap = () => {
    if (isComplete) return;
    setIsComplete(true);
    addHeart();
  };

  // TTS messages
  const ttsText = isComplete
    ? `잘했어요! ${state.npc.name}가 활짝 웃고 있어요. 먼저 다가가면 친구도 기뻐해요!`
    : `${state.npc.name}가 교실 한쪽에서 혼자 클레이 놀이를 하고 있어요. 아무도 다가가지 않았네요. 우리가 먼저 인사를 건네볼까요? 같이 놀자 말풍선을 눌러주세요.`;
  useTTS(ttsText);

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', minHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <img src={LOW_BG_IMAGES.stages} alt="bg" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} />
      
      <ParticleCanvas effect={isComplete ? 'success' : 'ambient'} active={true} intensity={isComplete ? 2 : 0.5} width={width} height={height} style={{ pointerEvents: 'none', zIndex: 1 }} />

      <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', width: '100%', minHeight: '100%', padding: '24px 16px' }}>

        <div style={{ background: 'rgba(255,255,255,0.95)', padding: '16px 24px', borderRadius: 20, boxShadow: '0 8px 32px rgba(0,0,0,0.1)', textAlign: 'center', border: '3px solid #c7d2fe', width: '100%', maxWidth: 600 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: isComplete ? '#16a34a' : '#1e293b' }}>
            {isComplete ? '성공! 친구와 함께 놀게 되었어요.' : '친구에게 먼저 다가가 볼까요?'}
          </h2>
          <p style={{ fontSize: 15, color: '#64748b', marginTop: 8 }}>
            {isComplete ? `잘했어요! ${state.npc.name}가 활짝 웃고 있어요. 먼저 다가가면 친구도 기뻐해요!` : `${state.npc.name}가 교실 한쪽에서 혼자 클레이 놀이를 하고 있어요. 아무도 다가가지 않았네요. 우리가 먼저 인사를 건네볼까요? '같이 놀자' 말풍선을 눌러주세요.`}
          </p>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 40, width: '100%' }}>
          {!isComplete && (
            <div onClick={handleTap} className="animate-bounce" style={{
              background: 'white', padding: '16px 24px', borderRadius: '32px 32px 32px 4px',
              border: '4px solid #818cf8', boxShadow: '0 12px 24px rgba(99,102,241,0.2)',
              cursor: 'pointer', marginBottom: 24,
            }}>
              <span style={{ fontSize: 24, fontWeight: 800, color: '#4f46e5' }}>같이 놀자! 👋</span>
            </div>
          )}

          <div style={{ height: '40vh', position: 'relative' }}>
            <img src={getLowNpcImage(state.npc.gender, isComplete ? 'happy2' : 'default')} alt={state.npc.name} style={{ height: '100%', objectFit: 'contain' }} />
            {isComplete && <div style={{ position: 'absolute', top: '20%', right: -20, fontSize: 48, animation: 'pulse 1s infinite' }}>💖</div>}
          </div>
        </div>

        {isComplete && (
          <button onClick={() => { completeStage('low_stage1'); router.push('/low/episode/2'); }} style={{
            padding: '16px 40px', background: '#22c55e', color: 'white', border: 'none', borderRadius: 30, fontSize: 20, fontWeight: 800, cursor: 'pointer', boxShadow: '0 8px 24px rgba(34,197,94,0.4)', zIndex: 20,
          }}>다음으로 가기 ▸</button>
        )}
      </div>
    </div>
  );
}

// ===== Low Stage 2: 귀가 아파요 =====
function LowStage2() {
  const { state, completeStage, addHeart } = useGame();
  const router = useRouter();
  const [isComplete, setIsComplete] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { width, height } = useContainerSize(containerRef);

  // TTS messages
  const ttsText = isComplete
    ? `와! 헤드폰 덕분에 소음이 줄어들었어요. ${state.npc.name}가 다시 편안해졌어요. 같은 소리도 사람마다 다르게 느낄 수 있어요!`
    : `앗, 밖에서 공사 소리가 쿵쿵 울려요! 우리한테는 그냥 좀 시끄러운 소리지만, ${state.npc.name}에게는 귀가 아플 만큼 크게 들려요. 헤드폰을 눌러서 도와주세요!`;
  useTTS(ttsText);

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', minHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <img src={LOW_BG_IMAGES.stages} alt="bg" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: isComplete ? 0.3 : 0.8, filter: isComplete ? 'sepia(1)' : 'none', transition: 'all 1s' }} />
      <div style={{ position: 'absolute', inset: 0, background: isComplete ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)', transition: 'all 1s' }} />

      <ParticleCanvas effect={isComplete ? 'firework' : 'ambient'} active={true} intensity={isComplete ? 2 : 0.5} width={width} height={height} style={{ pointerEvents: 'none', zIndex: 1 }} />

      <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', width: '100%', minHeight: '100%', padding: '24px 16px' }}>

        <div style={{ background: 'rgba(255,255,255,0.95)', padding: '16px 24px', borderRadius: 20, boxShadow: '0 8px 32px rgba(0,0,0,0.1)', textAlign: 'center', border: `3px solid ${isComplete ? '#86efac' : '#fca5a5'}`, width: '100%', maxWidth: 600 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: isComplete ? '#15803d' : '#b91c1c' }}>
            {isComplete ? '헤드폰을 씌워주었어요!' : `${state.npc.name}가 시끄러운 소리 때문에 힘들어해요!`}
          </h2>
          <p style={{ fontSize: 14, color: '#64748b', marginTop: 8 }}>
            {isComplete ? `와! 헤드폰 덕분에 소음이 줄어들었어요. ${state.npc.name}가 다시 편안해졌어요. 같은 소리도 사람마다 다르게 느낄 수 있어요!` : `앗, 밖에서 공사 소리가 쿵쿵 울려요! 우리한테는 그냥 좀 시끄러운 소리지만, ${state.npc.name}에게는 귀가 아플 만큼 크게 들려요. 헤드폰을 눌러서 도와주세요!`}
          </p>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', gap: 32 }}>
          {!isComplete && (
            <div onClick={() => { setIsComplete(true); addHeart(); }} style={{ background: 'white', padding: 24, borderRadius: '50%', border: '4px solid #fca5a5', boxShadow: '0 0 30px rgba(239,68,68,0.6)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', animation: 'pulse 1.5s infinite' }}>
              <img src={ITEM_IMAGES.headset} alt="headset" style={{ width: 100, height: 100, objectFit: 'contain' }} />
              <span style={{ fontSize: 18, fontWeight: 800, color: '#475569', marginTop: 12 }}>눌러서 씌워주기</span>
            </div>
          )}

          <div style={{ height: '40vh', position: 'relative' }}>
            <img src={getLowNpcImage(state.npc.gender, isComplete ? 'happy2' : 'earblock')} alt={state.npc.name} style={{ height: '100%', objectFit: 'contain' }} />
            {isComplete && <img src={ITEM_IMAGES.headset} alt="headset" style={{ position: 'absolute', top: -10, right: -20, width: 80, height: 80, animation: 'bounce 2s infinite' }} />}
          </div>
        </div>

        {isComplete && (
          <button onClick={() => { completeStage('low_stage2'); router.push('/low/episode/3'); }} style={{ padding: '16px 40px', background: '#22c55e', color: 'white', border: 'none', borderRadius: 30, fontSize: 20, fontWeight: 800, cursor: 'pointer', boxShadow: '0 8px 24px rgba(34,197,94,0.4)', zIndex: 20 }}>다음으로 가기 ▸</button>
        )}
      </div>
    </div>
  );
}

// ===== Low Stage 3: 기다려주기 =====
function LowStage3() {
  const { state, completeStage, addHeart } = useGame();
  const router = useRouter();
  const [tapCount, setTapCount] = useState(0);
  const isComplete = tapCount >= 3;
  const containerRef = useRef<HTMLDivElement>(null);
  const { width, height } = useContainerSize(containerRef);

  useEffect(() => {
    if (isComplete) addHeart();
  }, [isComplete]);

  // TTS messages
  const ttsText = isComplete
    ? `참 잘했어요! 조금 기다려주니까 ${state.npc.name}가 자기 생각을 말할 수 있었어요. 기다림은 가장 쉬운 도움이에요!`
    : `${state.npc.name}에게 질문을 했는데, 대답이 조금 늦어지고 있어요. 생각하는 데 시간이 더 필요한 친구도 있어요. 시계 버튼을 3번 눌러서 기다려줄까요?`;
  useTTS(ttsText);

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', minHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <img src={LOW_BG_IMAGES.stages} alt="bg" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }} />
      
      <ParticleCanvas effect={isComplete ? 'success' : 'ambient'} active={true} intensity={isComplete ? 2 : 0.5} width={width} height={height} style={{ pointerEvents: 'none', zIndex: 1 }} color={isComplete ? '#6366f1' : undefined} />

      <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', width: '100%', minHeight: '100%', padding: '24px 16px' }}>

        <div style={{ background: 'rgba(255,255,255,0.95)', padding: '16px 24px', borderRadius: 20, boxShadow: '0 8px 32px rgba(0,0,0,0.1)', textAlign: 'center', border: '3px solid #c7d2fe', width: '100%', maxWidth: 600 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: isComplete ? '#16a34a' : '#1e293b' }}>
            {isComplete ? `참 잘했어요! ${state.npc.name}가 대답을 했어요!` : `시계 버튼을 눌러주세요! (${tapCount}/3)`}
          </h2>
          <p style={{ fontSize: 15, color: '#64748b', marginTop: 8 }}>
            {isComplete ? `조금 기다려주니까 ${state.npc.name}가 자기 생각을 말할 수 있었어요. 기다림은 가장 쉬운 도움이에요!` : `${state.npc.name}에게 질문을 했는데, 대답이 조금 늦어지고 있어요. 생각하는 데 시간이 더 필요한 친구도 있어요. 시계 버튼을 3번 눌러서 기다려줄까요?`}
          </p>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', gap: 32 }}>

          <div style={{ display: 'flex', gap: 16, background: '#1e293b', padding: 20, borderRadius: 40, border: '4px solid #334155', boxShadow: '0 16px 32px rgba(0,0,0,0.5)' }}>
            <div style={{ width: 60, height: 60, borderRadius: '50%', background: tapCount === 1 ? '#ef4444' : '#7f1d1d', boxShadow: tapCount === 1 ? '0 0 30px #ef4444' : 'inset 0 -5px 15px rgba(0,0,0,0.5)', transition: 'all 0.3s' }} />
            <div style={{ width: 60, height: 60, borderRadius: '50%', background: tapCount === 2 ? '#eab308' : '#713f12', boxShadow: tapCount === 2 ? '0 0 30px #eab308' : 'inset 0 -5px 15px rgba(0,0,0,0.5)', transition: 'all 0.3s' }} />
            <div style={{ width: 60, height: 60, borderRadius: '50%', background: tapCount >= 3 ? '#22c55e' : '#14532d', boxShadow: tapCount >= 3 ? '0 0 30px #22c55e' : 'inset 0 -5px 15px rgba(0,0,0,0.5)', transition: 'all 0.3s', transform: tapCount >= 3 ? 'scale(1.1)' : 'scale(1)' }} />
          </div>

          <div style={{ height: '35vh', position: 'relative' }}>
            <img src={getLowNpcImage(state.npc.gender, isComplete ? 'happy2' : 'default')} alt={state.npc.name} style={{ height: '100%', objectFit: 'contain' }} />
            {isComplete && <div style={{ position: 'absolute', top: -30, left: '50%', transform: 'translateX(-50%)', background: 'white', padding: '12px 20px', borderRadius: 24, fontSize: 18, border: '2px solid #c7d2fe', fontWeight: 800, whiteSpace: 'nowrap' }}>기다려줘서<br />고마워!</div>}
          </div>

          {!isComplete && (
            <div onClick={() => setTapCount(v => v + 1)} style={{ background: 'white', padding: 24, borderRadius: '50%', border: '4px solid #c7d2fe', boxShadow: '0 0 30px rgba(99,102,241,0.6)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', animation: 'pulse 1.5s infinite' }}>
              <Icon name="clock" size={56} alt="시계" style={{ marginBottom: 8 }} />
              <span style={{ fontSize: 18, fontWeight: 800, color: '#475569' }}>기다리기</span>
            </div>
          )}

        </div>

        {isComplete && (
          <button onClick={() => { completeStage('low_stage3'); router.push('/low/episode/4'); }} style={{ padding: '16px 40px', background: '#22c55e', color: 'white', border: 'none', borderRadius: 30, fontSize: 20, fontWeight: 800, cursor: 'pointer', boxShadow: '0 8px 24px rgba(34,197,94,0.4)', zIndex: 20 }}>다음으로 가기 ▸</button>
        )}
      </div>
    </div>
  );
}

// ===== Low Stage 4: 쉽게 말해주기 =====
function LowStage4() {
  const { state, completeStage, addHeart } = useGame();
  const router = useRouter();
  const [phase, setPhase] = useState<'card_selection' | 'squishy_tapping' | 'done'>('card_selection');
  const [tapCount, setTapCount] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const { width, height } = useContainerSize(containerRef);

  // TTS messages
  const ttsText = phase === 'card_selection'
    ? `${state.npc.name}가 속상해서 말로 표현하기 어려운 것 같아요. 그림 카드를 보여주면, 그림으로 자기 마음을 표현할 수 있어요!`
    : phase === 'squishy_tapping'
    ? `${state.npc.name}가 그림 카드로 말랑이가 필요하다고 알려줬어요! 말랑이를 3번 눌러서 친구를 달래주세요.`
    : `최고! 그림 카드와 말랑이 덕분에 ${state.npc.name}가 다시 편안해졌어요. 말로 표현하기 어려울 때, 다른 방법으로 도와줄 수 있어요!`;
  useTTS(ttsText);

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', minHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <img src={LOW_BG_IMAGES.stages} alt="bg" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }} />
      
      <ParticleCanvas effect={phase === 'done' ? 'success' : 'ambient'} active={true} intensity={phase === 'done' ? 2 : 0.5} width={width} height={height} style={{ pointerEvents: 'none', zIndex: 1 }} color="#a855f7" />

      <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', width: '100%', minHeight: '100%', padding: '24px 16px' }}>

        <div style={{ background: 'rgba(255,255,255,0.95)', padding: '16px 24px', borderRadius: 20, boxShadow: '0 8px 32px rgba(0,0,0,0.1)', textAlign: 'center', border: '3px solid #a5b4fc', width: '100%', maxWidth: 600 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: phase === 'done' ? '#16a34a' : '#1e293b' }}>
            {phase === 'card_selection' && `${state.npc.name}가 많이 속상해 보여요.`}
            {phase === 'squishy_tapping' && `말랑이를 3번 눌러주세요! (${tapCount}/3)`}
            {phase === 'done' && `최고! ${state.npc.name}가 다시 편안해졌어요!`}
          </h2>
          <p style={{ fontSize: 15, color: '#64748b', marginTop: 8 }}>
            {phase === 'card_selection' && `${state.npc.name}가 속상해서 말로 표현하기 어려운 것 같아요. 그림 카드를 보여주면, 그림으로 자기 마음을 표현할 수 있어요!`}
            {phase === 'squishy_tapping' && `${state.npc.name}가 그림 카드로 말랑이가 필요하다고 알려줬어요! 말랑이를 눌러서 친구를 달래주세요.`}
            {phase === 'done' && `그림 카드와 말랑이 덕분에 ${state.npc.name}가 편안해졌어요. 말로 표현하기 어려울 때, 다른 방법으로 도와줄 수 있어요!`}
          </p>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', gap: 32 }}>

          {phase === 'card_selection' && (
            <div onClick={() => setPhase('squishy_tapping')} style={{ background: 'white', padding: 32, borderRadius: 48, border: '4px dashed #818cf8', cursor: 'pointer', textAlign: 'center', animation: 'pulse 1.5s infinite' }}>
              <img src={ITEM_IMAGES.pecs} alt="카드" style={{ width: 120, height: 120, objectFit: 'contain', marginBottom: 16 }} />
              <div style={{ background: 'white', padding: '8px 24px', borderRadius: 20, fontSize: 22, fontWeight: 800, color: '#4f46e5', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>그림 카드 보기</div>
            </div>
          )}

          {phase === 'squishy_tapping' && (
            <div onClick={() => { if (tapCount + 1 >= 3) { setPhase('done'); addHeart(); } else { setTapCount(v => v + 1); } }} style={{ position: 'relative', cursor: 'pointer', padding: 32 }}>
              <div style={{ position: 'absolute', inset: 0, background: '#f9a8d4', borderRadius: '50%', opacity: 0.5, animation: 'ping 1s infinite' }} />
              <img src={ITEM_IMAGES.squishy} alt="말랑이" style={{ position: 'relative', zIndex: 10, width: 150, height: 150, objectFit: 'contain', transform: `scale(${1 + tapCount * 0.1})`, transition: 'transform 0.2s' }} />
              <div style={{ position: 'absolute', bottom: -10, left: '50%', transform: 'translateX(-50%)', background: 'white', padding: '8px 24px', borderRadius: 24, fontSize: 18, fontWeight: 800, color: '#db2777', whiteSpace: 'nowrap', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 20 }}>눌러주세요! 🖐</div>
            </div>
          )}

          <div style={{ height: '35vh', position: 'relative' }}>
            <img src={getLowNpcImage(state.npc.gender, phase === 'done' ? 'happy' : 'upset')} alt={state.npc.name} style={{ height: '100%', objectFit: 'contain' }} />
            {phase === 'done' && <div style={{ position: 'absolute', top: 20, right: -20, fontSize: 48, animation: 'bounce 1s infinite' }}>✨</div>}
          </div>

        </div>

        {phase === 'done' && (
          <button onClick={() => { completeStage('low_stage4'); router.push('/low/ending'); }} style={{ padding: '16px 40px', background: '#22c55e', color: 'white', border: 'none', borderRadius: 30, fontSize: 20, fontWeight: 800, cursor: 'pointer', boxShadow: '0 8px 24px rgba(34,197,94,0.4)', zIndex: 20 }}>다음으로 가기 ▸</button>
        )}
      </div>
    </div>
  );
}

// ===== Main Stage Router =====
const STAGE_COMPONENTS = [LowStage1, LowStage2, LowStage3, LowStage4];

export default function LowStagePage() {
  const params = useParams();
  const index = parseInt(params.id as string) - 1;

  if (index < 0 || index >= STAGE_COMPONENTS.length) {
    return <div style={{ color: 'white', padding: 40, textAlign: 'center' }}>잘못된 단계입니다.</div>;
  }

  const StageComponent = STAGE_COMPONENTS[index];

  return (
    <>
      <TopNavBar />
      <div className="game-area" style={{ display: 'flex', flexDirection: 'column' }}>
        <StageComponent />
      </div>
    </>
  );
}
