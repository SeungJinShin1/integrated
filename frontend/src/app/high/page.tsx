'use client';

import { useRouter } from 'next/navigation';
import { useGame } from '@/contexts/GameContext';
import TopNavBar from '@/components/layout/TopNavBar';
import { HIGH_STAGES } from '@/data/gameData';
import {
  BG_IMAGES,
  STAGE_NODE_IMAGES,
  LOCK_OVERLAY_IMAGE,
  BADGE_IMAGES,
} from '@/data/assetMap';
import { useState, useRef, useEffect } from 'react';

// Six landmark positions aligned with the 6 white circles on the world map background.
// Order matches HIGH_STAGES (stage-1 … stage-6).
// 좌표는 배경 이미지(고학년 미션 월드맵) 안의 하얀색 빈 원 중심점을 기준으로
// 실측하여 잡았습니다. 퍼센트는 이미지 렌더 영역(imgBounds)에 상대적이며,
// contain 방식이므로 뷰포트 비율이 바뀌어도 위치가 유지됩니다.
const NODE_POSITIONS = [
  { left: '18%', top: '30.5%' }, // stage-1 앵무새의 숲 — 6시 1.5% ↓
  { left: '29.5%', top: '64%' }, // stage-2 폭탄이 터졌다 — 12시 2% ↑
  { left: '60%', top: '25.5%' }, // stage-3 기차는 멈추지 않아 — 6시 1.5% ↓
  { left: '67.5%', top: '52%' }, // stage-4 사라진 퍼즐 조각
  { left: '52%', top: '84%' }, // stage-5 갈림길의 기억 — 12시 2% ↑
  { left: '87%', top: '72%' }, // stage-6 빛나는 우리 반 — 12시 2% ↑
];

// 배경 이미지 원본 크기 2752×1536 의 가로세로비.
// ResizeObserver 로 컨테이너를 감시하여, contain 방식으로 이미지가 렌더될 영역을
// 계산하고 노드를 해당 영역 위에 배치합니다. → 뷰포트 비율이 바뀌어도 노드 위치 고정.
const MAP_ASPECT = 2752 / 1536;

export default function HighGradePage() {
  const router = useRouter();
  const { state, dispatch } = useGame();
  const [showLockedAlert, setShowLockedAlert] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const [imgBounds, setImgBounds] = useState({ x: 0, y: 0, w: 0, h: 0 });

  /* 컨테이너 크기가 바뀔 때마다 "contain" 렌더 영역 재계산 */
  useEffect(() => {
    const el = mapRef.current;
    if (!el) return;
    const calc = () => {
      const cw = el.clientWidth;
      const ch = el.clientHeight;
      if (cw === 0 || ch === 0) return;
      const cAspect = cw / ch;
      let w: number, h: number, x: number, y: number;
      if (cAspect > MAP_ASPECT) {
        h = ch; w = ch * MAP_ASPECT;
        x = (cw - w) / 2; y = 0;
      } else {
        w = cw; h = cw / MAP_ASPECT;
        x = 0; y = (ch - h) / 2;
      }
      setImgBounds({ x, y, w, h });
    };
    calc();
    const ro = new ResizeObserver(calc);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

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
          ref={mapRef}
          className="world-map"
          style={{ background: '#0f172a' }}
        >
          {/* 배경 이미지 — contain 방식으로 원본 비율 유지, 절대 크롭하지 않음 */}
          {imgBounds.w > 0 && (
            <img
              src={encodeURI(BG_IMAGES.highMap)}
              alt=""
              draggable={false}
              style={{
                position: 'absolute',
                left: imgBounds.x,
                top: imgBounds.y,
                width: imgBounds.w,
                height: imgBounds.h,
                pointerEvents: 'none',
              }}
            />
          )}

          {/* 이미지 영역 위에 정확히 겹치는 레이어 — 모든 노드 좌표의 기준점 */}
          <div style={{
            position: 'absolute',
            left: imgBounds.x,
            top: imgBounds.y,
            width: imgBounds.w || '100%',
            height: imgBounds.h || '100%',
          }}>

          {/* Subtle overlay so the landmark sprites stay readable */}
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.18)' }} />

          {/* Title */}
          <div style={{
            position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)',
            textAlign: 'center', zIndex: 20, width: '92%',
          }}>
            <h1 style={{
              fontSize: 'clamp(18px, 2.6vw, 26px)', fontWeight: 800, color: 'white',
              textShadow: '0 2px 12px rgba(0,0,0,0.7)',
            }}>
              우리 반 보물찾기 지도
            </h1>
            <p style={{
              fontSize: 'clamp(11px, 1.4vw, 14px)', color: 'rgba(255,255,255,0.85)', marginTop: 4,
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
                    // 태블릿(10~13")에서도 적정 크기를 유지하도록 vw 기반 fluid 사이즈
                    width: 'clamp(84px, 10vw, 132px)',
                    height: 'clamp(84px, 10vw, 132px)',
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

                  {/* 단계별 배지 이미지 (기존 완료 도장 대신) */}
                  {isCompleted && BADGE_IMAGES[stage.id] && (
                    <img
                      src={BADGE_IMAGES[stage.id].src}
                      alt={BADGE_IMAGES[stage.id].label}
                      style={{
                        position: 'absolute',
                        top: -8,
                        right: -8,
                        width: 'clamp(40px, 4.8vw, 64px)',
                        height: 'clamp(40px, 4.8vw, 64px)',
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
                    background: 'rgba(15,23,42,0.82)',
                    backdropFilter: 'blur(6px)',
                    color: 'white',
                    padding: 'clamp(4px, 0.6vw, 6px) clamp(10px, 1.2vw, 14px)',
                    borderRadius: 14,
                    fontSize: 'clamp(11px, 1.1vw, 13px)',
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

          </div>{/* /이미지 영역 오버레이 */}

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
