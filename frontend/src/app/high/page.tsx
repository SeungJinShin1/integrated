'use client';

import { useRouter } from 'next/navigation';
import { useGame } from '@/contexts/GameContext';
import TopNavBar from '@/components/layout/TopNavBar';
import { HIGH_STAGES } from '@/data/gameData';
import {
  BG_IMAGES,
  STAGE_NODE_IMAGES,
  LOCK_OVERLAY_IMAGE,
  COMPLETE_BADGE_IMAGE,
} from '@/data/assetMap';
import { useState } from 'react';

// Six landmark positions aligned with the 6 white circles on the world map background.
// Order matches HIGH_STAGES (stage-1 … stage-6).
const NODE_POSITIONS = [
  { left: '19%', top: '33%' }, // stage-1 앵무새의 숲 — top-left forest circle
  { left: '22%', top: '57%' }, // stage-2 폭탄이 터졌다 — mid-left circle (below forest)
  { left: '57%', top: '26%' }, // stage-3 기차는 멈추지 않아 — top train hill circle
  { left: '62%', top: '47%' }, // stage-4 사라진 퍼즐 조각 — mid-right mosaic circle
  { left: '48%', top: '78%' }, // stage-5 갈림길의 기억 — bottom forest circle
  { left: '82%', top: '62%' }, // stage-6 빛나는 우리 반 — prism-house circle (far right)
];

export default function HighGradePage() {
  const router = useRouter();
  const { state, dispatch } = useGame();
  const [showLockedAlert, setShowLockedAlert] = useState(false);

  const completedStages = state.completedStages || [];
  const allPreviousComplete = ['stage-1', 'stage-2', 'stage-3', 'stage-4', 'stage-5']
    .every(s => completedStages.includes(s));

  const handleStageClick = (stageId: string, index: number) => {
    if (stageId === 'stage-6' && !allPreviousComplete) {
      setShowLockedAlert(true);
      setTimeout(() => setShowLockedAlert(false), 3000);
      return;
    }
    dispatch({ type: 'SET_STAGE', payload: stageId });
    if (stageId === 'stage-6') {
      router.push('/high/lab');
    } else {
      router.push(`/high/stage/${index + 1}`);
    }
  };

  return (
    <>
      <TopNavBar />
      <div className="game-area">
        <div
          className="world-map"
          style={{
            // 파일명에 공백/괄호가 있어 CSS url()이 그대로 파싱 못 함 → 인코딩 + 따옴표로 감쌈
            backgroundImage: `url("${encodeURI(BG_IMAGES.highMap)}")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            position: 'relative',
          }}
        >
          {/* Subtle overlay so the landmark sprites stay readable */}
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.18)' }} />

          {/* Title */}
          <div style={{
            position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)',
            textAlign: 'center', zIndex: 20,
          }}>
            <h1 style={{
              fontSize: 24, fontWeight: 800, color: 'white',
              textShadow: '0 2px 12px rgba(0,0,0,0.7)',
            }}>
              우리 반 보물찾기 지도
            </h1>
            <p style={{
              fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 4,
              textShadow: '0 1px 8px rgba(0,0,0,0.6)',
            }}>
              단계를 선택하여 히든피스를 찾으러 떠나요
            </p>
          </div>

          {/* Landmark nodes */}
          {HIGH_STAGES.map((stage, i) => {
            const isCompleted = completedStages.includes(stage.id);
            const isLocked = stage.id === 'stage-6' && !allPreviousComplete;
            const nodeImage = STAGE_NODE_IMAGES[stage.id];

            return (
              <button
                type="button"
                key={stage.id}
                className={`map-node ${isLocked ? 'locked' : ''}`}
                style={{
                  ...(NODE_POSITIONS[i] as React.CSSProperties),
                  zIndex: 10,
                  position: 'absolute',
                  transform: 'translate(-50%, -50%)',
                  background: 'transparent',
                  border: 'none',
                  padding: 0,
                  cursor: isLocked ? 'not-allowed' : 'pointer',
                  textAlign: 'center',
                  outline: 'none',
                }}
                onClick={() => handleStageClick(stage.id, i)}
                aria-label={`${stage.title} ${isLocked ? '(잠김)' : ''}`}
              >
                <div
                  style={{
                    position: 'relative',
                    width: 132,
                    height: 132,
                    margin: '0 auto',
                    transition: 'transform 0.2s ease',
                    filter: isLocked
                      ? 'grayscale(0.85) brightness(0.6)'
                      : isCompleted
                        ? 'drop-shadow(0 0 12px rgba(16,185,129,0.55))'
                        : 'drop-shadow(0 8px 18px rgba(0,0,0,0.45))',
                  }}
                >
                  {nodeImage && (
                    <img
                      src={nodeImage}
                      alt={stage.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        pointerEvents: 'none',
                      }}
                    />
                  )}

                  {/* Lock overlay sprite */}
                  {isLocked && (
                    <img
                      src={LOCK_OVERLAY_IMAGE}
                      alt="잠금"
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        width: '70%',
                        height: '70%',
                        transform: 'translate(-50%, -50%)',
                        objectFit: 'contain',
                        pointerEvents: 'none',
                      }}
                    />
                  )}

                  {/* Completed badge sprite */}
                  {isCompleted && (
                    <img
                      src={COMPLETE_BADGE_IMAGE}
                      alt="완료"
                      style={{
                        position: 'absolute',
                        top: -10,
                        right: -10,
                        width: 56,
                        height: 56,
                        objectFit: 'contain',
                        pointerEvents: 'none',
                        filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.4))',
                      }}
                    />
                  )}
                </div>

                <div
                  style={{
                    marginTop: 6,
                    display: 'inline-block',
                    background: 'rgba(15,23,42,0.78)',
                    backdropFilter: 'blur(6px)',
                    color: 'white',
                    padding: '6px 14px',
                    borderRadius: 14,
                    fontSize: 13,
                    fontWeight: 800,
                    border: '1px solid rgba(255,255,255,0.18)',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.35)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {stage.title}
                </div>
              </button>
            );
          })}

          {/* Locked Alert */}
          {showLockedAlert && (
            <div style={{
              position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              background: 'rgba(10,15,30,0.95)', backdropFilter: 'blur(20px)',
              border: '1px solid rgba(239,68,68,0.3)', borderRadius: 20,
              padding: '32px 40px', textAlign: 'center', zIndex: 9999,
              boxShadow: '0 24px 48px rgba(0,0,0,0.5)',
            }}>
              <h2 style={{ color: '#ef4444', fontSize: 20, fontWeight: 800, marginBottom: 8 }}>
                잠금 상태
              </h2>
              <p style={{ color: '#94a3b8', fontSize: 15 }}>
                1~5단계를 모두 완료해야<br/>「빛나는 우리 반」을 완성할 수 있어요!
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
