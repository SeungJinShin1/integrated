'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useGame } from '@/contexts/GameContext';
import TopNavBar from '@/components/layout/TopNavBar';
import { getLowNpcImage, LOW_BG_IMAGES, ITEM_IMAGES } from '@/data/assetMap';
import Icon from '@/components/ui/Icon';
import ParticleCanvas from '@/components/minigames/ParticleCanvas';
import { useVoiceNarration } from '@/hooks/useVoiceNarration';
import { LOW_VOICE } from '@/data/assetMap';

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

// ===== 공통 스타일 토큰 (저학년 1.5배 크게) =====
const TITLE_H2: React.CSSProperties = {
  fontSize: 'clamp(24px, 3.2vw, 34px)',
  fontWeight: 900,
  letterSpacing: '-0.5px',
  lineHeight: 1.3,
};
const TITLE_P: React.CSSProperties = {
  fontSize: 'clamp(15px, 1.6vw, 19px)',
  color: '#334155',
  marginTop: 10,
  fontWeight: 600,
  lineHeight: 1.55,
};
const TITLE_CARD: React.CSSProperties = {
  background: 'rgba(255,255,255,0.97)',
  padding: 'clamp(18px, 2.4vw, 28px) clamp(24px, 3vw, 40px)',
  borderRadius: 22,
  boxShadow: '0 10px 32px rgba(15,23,42,0.18)',
  textAlign: 'center',
  width: '100%',
  maxWidth: 820,
};
const NEXT_BTN: React.CSSProperties = {
  padding: '18px 48px',
  background: 'linear-gradient(135deg, #22c55e, #16a34a)',
  color: 'white',
  border: 'none',
  borderRadius: 36,
  fontSize: 22,
  fontWeight: 900,
  cursor: 'pointer',
  boxShadow: '0 12px 28px rgba(34,197,94,0.45)',
  zIndex: 20,
  fontFamily: "'Nanum Gothic', sans-serif",
};
// 캐릭터 크기: 기존 35~40vh → 1.5배 키워 55vh
const CHARACTER_BOX: React.CSSProperties = {
  height: 'clamp(320px, 55vh, 560px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
};
// 말풍선(대화창) — 글씨는 반드시 어두운 색
const BUBBLE: React.CSSProperties = {
  background: 'white',
  padding: '14px 22px',
  borderRadius: 24,
  border: '3px solid #c7d2fe',
  fontWeight: 800,
  fontSize: 18,
  color: '#1e293b',
  boxShadow: '0 10px 24px rgba(0,0,0,0.12)',
  whiteSpace: 'nowrap',
  maxWidth: 320,
};

// ===== Low Stage 1: 먼저 물어봐주기 =====
function LowStage1() {
  const { state, completeStage, addHeart } = useGame();
  const router = useRouter();
  const alreadyDone = (state.completedStages || []).includes('low_stage1');
  const [isComplete, setIsComplete] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { width, height } = useContainerSize(containerRef);

  const handleTap = () => {
    if (isComplete) return;
    setIsComplete(true);
    if (!alreadyDone) addHeart();
  };

  const voiceSrc = isComplete ? LOW_VOICE.ep1_complete : LOW_VOICE.ep1_intro;
  useVoiceNarration(voiceSrc);

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      <img src={LOW_BG_IMAGES.stages} alt="bg" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} />
      <ParticleCanvas effect={isComplete ? 'success' : 'ambient'} active={true} intensity={isComplete ? 2 : 0.5} width={width} height={height} style={{ pointerEvents: 'none', zIndex: 1 }} />

      <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', gap: 28, width: '100%', minHeight: '100%', padding: 'clamp(16px, 2.5vw, 32px) clamp(16px, 2.5vw, 32px) clamp(24px, 3vw, 36px)' }}>

        {/* 상단 타이틀 카드 (1.5배 키움) */}
        <div style={{ ...TITLE_CARD, border: '3px solid #c7d2fe' }}>
          <h2 style={{ ...TITLE_H2, color: isComplete ? '#15803d' : '#1e293b' }}>
            {isComplete ? '성공! 친구와 함께 놀게 되었어요.' : '친구에게 먼저 다가가 볼까요?'}
          </h2>
          <p style={TITLE_P}>
            {isComplete ? '잘했어요! 친구가 활짝 웃고 있어요. 먼저 다가가면 친구도 기뻐해요!' : '친구가 교실 한쪽에서 혼자 클레이 놀이를 하고 있어요. 아무도 다가가지 않았네요. 우리가 먼저 인사를 건네볼까요? 같이 놀자 말풍선을 눌러주세요.'}
          </p>
        </div>

        {/* 중단: 말풍선 + 캐릭터 좌우 배치 */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'clamp(24px, 4vw, 64px)', width: '100%', flexWrap: 'wrap' }}>
          {!isComplete ? (
            <div
              onClick={handleTap}
              className="animate-bounce"
              style={{
                ...BUBBLE,
                background: 'white',
                padding: '22px 36px',
                borderRadius: '36px 36px 36px 6px',
                border: '4px solid #818cf8',
                fontSize: 28,
                color: '#4338ca',
                cursor: 'pointer',
                boxShadow: '0 16px 32px rgba(99,102,241,0.28)',
              }}
            >
              같이 놀자!
            </div>
          ) : (
            <div style={{ ...BUBBLE, borderColor: '#86efac', color: '#15803d', fontSize: 22 }}>
              우리 같이 놀자!
            </div>
          )}

          <div style={CHARACTER_BOX}>
            <img
              src={getLowNpcImage(state.npc.gender, isComplete ? 'happy2' : 'default')}
              alt={state.npc.name}
              style={{ height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 12px 32px rgba(0,0,0,0.2))' }}
            />
          </div>
        </div>

        {/* 하단 버튼 영역 */}
        <div style={{ minHeight: 72 }}>
          {isComplete && (
            <button onClick={() => { completeStage('low_stage1'); router.push('/low/episode/2'); }} style={NEXT_BTN}>
              다음으로 가기 ▸
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ===== Low Stage 2: 귀가 아파요 =====
function LowStage2() {
  const { state, completeStage, addHeart } = useGame();
  const router = useRouter();
  const alreadyDone = (state.completedStages || []).includes('low_stage2');
  const [isComplete, setIsComplete] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { width, height } = useContainerSize(containerRef);

  const voiceSrc = isComplete ? LOW_VOICE.ep2_complete : LOW_VOICE.ep2_intro;
  useVoiceNarration(voiceSrc);

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      <img src={LOW_BG_IMAGES.stages} alt="bg" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: isComplete ? 0.3 : 0.8, filter: isComplete ? 'sepia(1)' : 'none', transition: 'all 1s' }} />
      <div style={{ position: 'absolute', inset: 0, background: isComplete ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)', transition: 'all 1s' }} />
      <ParticleCanvas effect={isComplete ? 'firework' : 'ambient'} active={true} intensity={isComplete ? 2 : 0.5} width={width} height={height} style={{ pointerEvents: 'none', zIndex: 1 }} />

      <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', gap: 28, width: '100%', minHeight: '100%', padding: 'clamp(16px, 2.5vw, 32px) clamp(16px, 2.5vw, 32px) clamp(24px, 3vw, 36px)' }}>

        <div style={{ ...TITLE_CARD, border: `3px solid ${isComplete ? '#86efac' : '#fca5a5'}` }}>
          <h2 style={{ ...TITLE_H2, color: isComplete ? '#15803d' : '#b91c1c' }}>
            {isComplete ? '헤드폰을 씌워주었어요!' : '친구가 시끄러운 소리 때문에 힘들어해요!'}
          </h2>
          <p style={TITLE_P}>
            {isComplete ? '와! 헤드폰 덕분에 소음이 줄어들었어요. 친구가 다시 편안해졌어요. 같은 소리도 사람마다 다르게 느낄 수 있어요!' : '앗, 밖에서 공사 소리가 쿵쿵 울려요! 우리한테는 그냥 좀 시끄러운 소리지만, 친구에게는 귀가 아플 만큼 크게 들려요. 헤드폰을 눌러서 도와주세요!'}
          </p>
        </div>

        {/* 좌우 배치: 헤드폰 버튼 + 캐릭터 */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'clamp(24px, 4vw, 64px)', width: '100%', flexWrap: 'wrap' }}>
          {!isComplete && (
            <div
              onClick={() => { setIsComplete(true); if (!alreadyDone) addHeart(); }}
              style={{
                background: 'white',
                padding: 28,
                borderRadius: '50%',
                border: '5px solid #fca5a5',
                boxShadow: '0 0 40px rgba(239,68,68,0.55)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                animation: 'pulse 1.5s infinite',
              }}
            >
              <img src={ITEM_IMAGES.headset} alt="headset" style={{ width: 120, height: 120, objectFit: 'contain' }} />
              <span style={{ fontSize: 20, fontWeight: 800, color: '#1e293b', marginTop: 12 }}>눌러서 씌워주기</span>
            </div>
          )}

          <div style={CHARACTER_BOX}>
            <img
              src={getLowNpcImage(state.npc.gender, isComplete ? 'happy2' : 'earblock')}
              alt={state.npc.name}
              style={{ height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 12px 32px rgba(0,0,0,0.2))' }}
            />
            {isComplete && (
              <img
                src={ITEM_IMAGES.headset}
                alt="headset"
                style={{ position: 'absolute', top: '4%', right: '-6%', width: 92, height: 92, animation: 'bounce 2s infinite' }}
              />
            )}
          </div>
        </div>

        <div style={{ minHeight: 72 }}>
          {isComplete && (
            <button onClick={() => { completeStage('low_stage2'); router.push('/low/episode/3'); }} style={NEXT_BTN}>
              다음으로 가기 ▸
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ===== Low Stage 3: 기다려주기 =====
function LowStage3() {
  const { state, completeStage, addHeart } = useGame();
  const router = useRouter();
  const alreadyDone = (state.completedStages || []).includes('low_stage3');
  const [tapCount, setTapCount] = useState(0);
  const isComplete = tapCount >= 3;
  const containerRef = useRef<HTMLDivElement>(null);
  const { width, height } = useContainerSize(containerRef);

  useEffect(() => {
    if (isComplete && !alreadyDone) addHeart();
  }, [isComplete]);

  const voiceSrc = isComplete ? LOW_VOICE.ep3_complete : LOW_VOICE.ep3_intro;
  useVoiceNarration(voiceSrc);

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      <img src={LOW_BG_IMAGES.stages} alt="bg" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }} />
      <ParticleCanvas effect={isComplete ? 'success' : 'ambient'} active={true} intensity={isComplete ? 2 : 0.5} width={width} height={height} style={{ pointerEvents: 'none', zIndex: 1 }} color={isComplete ? '#6366f1' : undefined} />

      <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', gap: 28, width: '100%', minHeight: '100%', padding: 'clamp(16px, 2.5vw, 32px) clamp(16px, 2.5vw, 32px) clamp(24px, 3vw, 36px)' }}>

        <div style={{ ...TITLE_CARD, border: '3px solid #c7d2fe' }}>
          <h2 style={{ ...TITLE_H2, color: isComplete ? '#15803d' : '#1e293b' }}>
            {isComplete ? '참 잘했어요! 친구가 대답을 했어요!' : `시계 버튼을 눌러주세요! (${tapCount}/3)`}
          </h2>
          <p style={TITLE_P}>
            {isComplete ? '조금 기다려주니까 친구가 자기 생각을 말할 수 있었어요. 기다림은 가장 쉬운 도움이에요!' : '친구에게 질문을 했는데, 대답이 조금 늦어지고 있어요. 생각하는 데 시간이 더 필요한 친구도 있어요. 시계 버튼을 3번 눌러서 기다려줄까요?'}
          </p>
        </div>

        {/* 좌우 배치: 신호등+시계 | 캐릭터 */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'clamp(24px, 4vw, 64px)', width: '100%', flexWrap: 'wrap' }}>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
            {/* 신호등 (기다림 시각화) */}
            <div style={{ display: 'flex', gap: 16, background: '#1e293b', padding: 20, borderRadius: 40, border: '4px solid #334155', boxShadow: '0 16px 32px rgba(0,0,0,0.5)' }}>
              <div style={{ width: 60, height: 60, borderRadius: '50%', background: tapCount === 1 ? '#ef4444' : '#7f1d1d', boxShadow: tapCount === 1 ? '0 0 30px #ef4444' : 'inset 0 -5px 15px rgba(0,0,0,0.5)', transition: 'all 0.3s' }} />
              <div style={{ width: 60, height: 60, borderRadius: '50%', background: tapCount === 2 ? '#eab308' : '#713f12', boxShadow: tapCount === 2 ? '0 0 30px #eab308' : 'inset 0 -5px 15px rgba(0,0,0,0.5)', transition: 'all 0.3s' }} />
              <div style={{ width: 60, height: 60, borderRadius: '50%', background: tapCount >= 3 ? '#22c55e' : '#14532d', boxShadow: tapCount >= 3 ? '0 0 30px #22c55e' : 'inset 0 -5px 15px rgba(0,0,0,0.5)', transition: 'all 0.3s', transform: tapCount >= 3 ? 'scale(1.1)' : 'scale(1)' }} />
            </div>
            {!isComplete && (
              <div onClick={() => setTapCount(v => v + 1)} style={{ background: 'white', padding: 26, borderRadius: '50%', border: '5px solid #c7d2fe', boxShadow: '0 0 30px rgba(99,102,241,0.55)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', animation: 'pulse 1.5s infinite' }}>
                <Icon name="clock" size={68} alt="시계" />
                <span style={{ fontSize: 20, fontWeight: 800, color: '#1e293b', marginTop: 10 }}>기다리기</span>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
            <div style={CHARACTER_BOX}>
              <img
                src={getLowNpcImage(state.npc.gender, isComplete ? 'happy2' : 'default')}
                alt={state.npc.name}
                style={{ height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 12px 32px rgba(0,0,0,0.2))' }}
              />
            </div>
            {isComplete && (
              <div style={{ ...BUBBLE, textAlign: 'center', whiteSpace: 'normal' }}>
                기다려줘서 고마워!
              </div>
            )}
          </div>
        </div>

        <div style={{ minHeight: 72 }}>
          {isComplete && (
            <button onClick={() => { completeStage('low_stage3'); router.push('/low/episode/4'); }} style={NEXT_BTN}>
              다음으로 가기 ▸
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ===== Low Stage 4: 쉽게 말해주기 =====
function LowStage4() {
  const { state, completeStage, addHeart } = useGame();
  const router = useRouter();
  const alreadyDone = (state.completedStages || []).includes('low_stage4');
  const [phase, setPhase] = useState<'card_selection' | 'squishy_tapping' | 'done'>('card_selection');
  const [tapCount, setTapCount] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const { width, height } = useContainerSize(containerRef);

  const voiceSrc = phase === 'card_selection'
    ? LOW_VOICE.ep4_card
    : phase === 'squishy_tapping'
    ? LOW_VOICE.ep4_squishy
    : LOW_VOICE.ep4_complete;
  useVoiceNarration(voiceSrc);

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      <img src={LOW_BG_IMAGES.stages} alt="bg" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }} />
      <ParticleCanvas effect={phase === 'done' ? 'success' : 'ambient'} active={true} intensity={phase === 'done' ? 2 : 0.5} width={width} height={height} style={{ pointerEvents: 'none', zIndex: 1 }} color="#a855f7" />

      <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', gap: 28, width: '100%', minHeight: '100%', padding: 'clamp(16px, 2.5vw, 32px) clamp(16px, 2.5vw, 32px) clamp(24px, 3vw, 36px)' }}>

        <div style={{ ...TITLE_CARD, border: '3px solid #a5b4fc' }}>
          <h2 style={{ ...TITLE_H2, color: phase === 'done' ? '#15803d' : '#1e293b' }}>
            {phase === 'card_selection' && '친구가 많이 속상해 보여요.'}
            {phase === 'squishy_tapping' && `말랑이를 3번 눌러주세요! (${tapCount}/3)`}
            {phase === 'done' && '최고! 친구가 다시 편안해졌어요!'}
          </h2>
          <p style={TITLE_P}>
            {phase === 'card_selection' && '친구가 속상해서 말로 표현하기 어려운 것 같아요. 그림 카드를 보여주면, 그림으로 자기 마음을 표현할 수 있어요!'}
            {phase === 'squishy_tapping' && '친구가 그림 카드로 말랑이가 필요하다고 알려줬어요! 말랑이를 3번 눌러서 친구를 달래주세요.'}
            {phase === 'done' && '그림 카드와 말랑이 덕분에 친구가 편안해졌어요. 말로 표현하기 어려울 때, 다른 방법으로 도와줄 수 있어요!'}
          </p>
        </div>

        {/* 좌우 배치: 카드/말랑이 | 캐릭터 */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'clamp(24px, 4vw, 64px)', width: '100%', flexWrap: 'wrap' }}>

          {phase === 'card_selection' && (
            <div onClick={() => setPhase('squishy_tapping')} style={{ background: 'white', padding: 32, borderRadius: 36, border: '4px dashed #818cf8', cursor: 'pointer', textAlign: 'center', animation: 'pulse 1.5s infinite', boxShadow: '0 16px 32px rgba(99,102,241,0.2)' }}>
              <img src={ITEM_IMAGES.pecs} alt="카드" style={{ width: 140, height: 140, objectFit: 'contain', marginBottom: 16 }} />
              <div style={{ padding: '10px 28px', borderRadius: 22, fontSize: 22, fontWeight: 900, color: '#4338ca' }}>그림 카드 보기</div>
            </div>
          )}

          {phase === 'squishy_tapping' && (
            <div onClick={() => { if (tapCount + 1 >= 3) { setPhase('done'); if (!alreadyDone) addHeart(); } else { setTapCount(v => v + 1); } }} style={{ position: 'relative', cursor: 'pointer', padding: 32 }}>
              <div style={{ position: 'absolute', inset: 0, background: '#f9a8d4', borderRadius: '50%', opacity: 0.5, animation: 'ping 1s infinite' }} />
              <img src={ITEM_IMAGES.squishy} alt="말랑이" style={{ position: 'relative', zIndex: 10, width: 170, height: 170, objectFit: 'contain', transform: `scale(${1 + tapCount * 0.1})`, transition: 'transform 0.2s', display: 'block' }} />
              <div style={{ marginTop: 14, background: 'white', padding: '10px 26px', borderRadius: 24, fontSize: 20, fontWeight: 900, color: '#be185d', textAlign: 'center', boxShadow: '0 6px 16px rgba(0,0,0,0.12)' }}>눌러주세요!</div>
            </div>
          )}

          <div style={CHARACTER_BOX}>
            <img
              src={getLowNpcImage(state.npc.gender, phase === 'done' ? 'happy' : 'upset')}
              alt={state.npc.name}
              style={{ height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 12px 32px rgba(0,0,0,0.2))' }}
            />
          </div>
        </div>

        <div style={{ minHeight: 72 }}>
          {phase === 'done' && (
            <button onClick={() => { completeStage('low_stage4'); router.push('/low/episode/5'); }} style={NEXT_BTN}>
              다음으로 가기 ▸
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ===== Low Stage 5: 다르게 놀아도 괜찮아 =====
function LowStage5() {
  const { state, completeStage, addHeart } = useGame();
  const router = useRouter();
  const alreadyDone = (state.completedStages || []).includes('low_stage5');
  const [isComplete, setIsComplete] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { width, height } = useContainerSize(containerRef);

  const handleTap = () => {
    if (isComplete) return;
    setIsComplete(true);
    if (!alreadyDone) addHeart();
  };

  const voiceSrc = isComplete ? LOW_VOICE.ep5_complete : LOW_VOICE.ep5_intro;
  useVoiceNarration(voiceSrc);

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      <img src={LOW_BG_IMAGES.stages} alt="bg" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} />
      <ParticleCanvas effect={isComplete ? 'success' : 'ambient'} active={true} intensity={isComplete ? 2 : 0.5} width={width} height={height} style={{ pointerEvents: 'none', zIndex: 1 }} />

      <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', gap: 28, width: '100%', minHeight: '100%', padding: 'clamp(16px, 2.5vw, 32px) clamp(16px, 2.5vw, 32px) clamp(24px, 3vw, 36px)' }}>

        <div style={{ ...TITLE_CARD, border: '3px solid #c7d2fe' }}>
          <h2 style={{ ...TITLE_H2, color: isComplete ? '#15803d' : '#1e293b' }}>
            {isComplete ? '친구의 방법대로 같이 놀았어요!' : '친구가 블록을 다르게 놀고 있어요.'}
          </h2>
          <p style={TITLE_P}>
            {isComplete
              ? '잘했어요! 친구의 방법대로 같이 놀아줬더니 친구가 활짝 웃어요. 나와 다른 방법도 틀린 게 아니에요!'
              : "친구가 블록을 높이 쌓지 않고, 일렬로 나열하고 있어요. 다르게 노는 것도 하나의 방법이에요! '같이 해볼래!' 말풍선을 눌러주세요."}
          </p>
        </div>

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'clamp(24px, 4vw, 64px)', width: '100%', flexWrap: 'wrap' }}>
          {!isComplete ? (
            <div
              onClick={handleTap}
              className="animate-bounce"
              style={{
                ...BUBBLE,
                background: 'white',
                padding: '22px 36px',
                borderRadius: '36px 36px 36px 6px',
                border: '4px solid #818cf8',
                fontSize: 28,
                color: '#4338ca',
                cursor: 'pointer',
                boxShadow: '0 16px 32px rgba(99,102,241,0.28)',
              }}
            >
              같이 해볼래!
            </div>
          ) : (
            <div style={{ ...BUBBLE, borderColor: '#86efac', color: '#15803d', fontSize: 22 }}>
              이렇게 나열하는 거구나!
            </div>
          )}

          <div style={CHARACTER_BOX}>
            <img
              src={getLowNpcImage(state.npc.gender, isComplete ? 'happy2' : 'default')}
              alt={state.npc.name}
              style={{ height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 12px 32px rgba(0,0,0,0.2))' }}
            />
          </div>
        </div>

        <div style={{ minHeight: 72 }}>
          {isComplete && (
            <button onClick={() => { completeStage('low_stage5'); router.push('/low/ending'); }} style={NEXT_BTN}>
              다음으로 가기 ▸
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ===== Main Stage Router =====
const STAGE_COMPONENTS = [LowStage1, LowStage2, LowStage3, LowStage4, LowStage5];

export default function LowStagePage() {
  const params = useParams();
  const { startStage } = useGame();
  const index = parseInt(params.id as string) - 1;
  const isValid = index >= 0 && index < STAGE_COMPONENTS.length;

  // 에피소드에 들어온 순간 교사 대시보드에 "진행 중"으로 표시
  useEffect(() => {
    if (isValid) startStage(`low_stage${index + 1}`);
  }, [isValid, index, startStage]);

  if (!isValid) {
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
