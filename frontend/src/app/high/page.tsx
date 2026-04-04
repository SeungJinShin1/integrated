'use client';

import { useRouter } from 'next/navigation';
import { useGame } from '@/contexts/GameContext';
import TopNavBar from '@/components/layout/TopNavBar';
import { HIGH_STAGES } from '@/data/gameData';
import { BG_IMAGES } from '@/data/assetMap';
import { FaLock } from 'react-icons/fa6';
import { useState } from 'react';

const NODE_POSITIONS = [
  { left: '12%', top: '25%' },
  { left: '32%', top: '55%' },
  { left: '52%', top: '20%' },
  { left: '68%', top: '50%' },
  { left: '85%', top: '22%' },
  { left: '50%', top: '75%' },
];

const NODE_COLORS = [
  'linear-gradient(135deg, #22c55e, #16a34a)',
  'linear-gradient(135deg, #ef4444, #dc2626)',
  'linear-gradient(135deg, #f59e0b, #d97706)',
  'linear-gradient(135deg, #a855f7, #9333ea)',
  'linear-gradient(135deg, #06b6d4, #0891b2)',
  'linear-gradient(135deg, #6366f1, #4f46e5)',
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
        <div className="world-map" style={{ backgroundImage: `url(${BG_IMAGES.dataworld})` }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.3)' }} />

          {/* Title */}
          <div style={{
            position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)',
            textAlign: 'center', zIndex: 20,
          }}>
            <h1 style={{
              fontSize: 24, fontWeight: 800, color: 'white',
              textShadow: '0 2px 12px rgba(0,0,0,0.6)',
            }}>
              🗺️ 미션 월드맵
            </h1>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>
              에피소드를 선택하여 모험을 시작하세요
            </p>
          </div>

          {/* Map Nodes */}
          {HIGH_STAGES.map((stage, i) => {
            const isCompleted = completedStages.includes(stage.id);
            const isLocked = stage.id === 'stage-6' && !allPreviousComplete;

            return (
              <div
                key={stage.id}
                className={`map-node ${isLocked ? 'locked' : ''}`}
                style={{ ...NODE_POSITIONS[i] as React.CSSProperties, zIndex: 10 }}
                onClick={() => handleStageClick(stage.id, i)}
              >
                <div style={{
                  background: isCompleted ? 'linear-gradient(135deg, #10b981, #059669)' : NODE_COLORS[i],
                  borderRadius: 20,
                  padding: '16px 24px',
                  textAlign: 'center',
                  minWidth: 140,
                  border: isCompleted ? '3px solid #34d399' : '2px solid rgba(255,255,255,0.3)',
                  boxShadow: isCompleted ? '0 0 20px rgba(16, 185, 129, 0.4)' : '0 4px 16px rgba(0,0,0,0.3)',
                  position: 'relative',
                }}>
                  {isLocked && (
                    <div style={{
                      position: 'absolute', top: -8, right: -8,
                      background: '#ef4444', borderRadius: '50%',
                      width: 28, height: 28, display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                    }}>
                      <FaLock style={{ color: 'white', fontSize: 12 }} />
                    </div>
                  )}
                  {isCompleted && (
                    <div style={{
                      position: 'absolute', top: -8, right: -8,
                      background: '#10b981', borderRadius: '50%',
                      width: 28, height: 28, display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      fontSize: 14, color: 'white', fontWeight: 800,
                    }}>
                      ✓
                    </div>
                  )}
                  <div style={{ fontSize: 28, marginBottom: 6 }}>{stage.emoji}</div>
                  <div style={{ color: 'white', fontSize: 14, fontWeight: 800, marginBottom: 4 }}>
                    {stage.title}
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11 }}>
                    {stage.subtitle}
                  </div>
                </div>
              </div>
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
              <div style={{ fontSize: 48, marginBottom: 12 }}>🔒</div>
              <h2 style={{ color: '#ef4444', fontSize: 20, fontWeight: 800, marginBottom: 8 }}>
                잠금 상태
              </h2>
              <p style={{ color: '#94a3b8', fontSize: 15 }}>
                1~5단계를 모두 완료해야<br/>프리즘 연구소에 입장할 수 있어요!
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
