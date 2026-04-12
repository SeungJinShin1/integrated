'use client';

import { useGame } from '@/contexts/GameContext';
import { TOOLS } from '@/data/gameData';
import { ITEM_IMAGES } from '@/data/assetMap';
import Icon from '@/components/ui/Icon';
import { useEffect, useState } from 'react';

export default function GameHUD() {
  const { state } = useGame();
  // 클릭해서 여는 상세 팝업 대상 도구 ID (null 이면 팝업 닫힘)
  const [activeTool, setActiveTool] = useState<string | null>(null);

  // ESC 로 팝업 닫기
  useEffect(() => {
    if (!activeTool) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveTool(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeTool]);

  // Do not show HUD on mode select, intro, or lab
  const hiddenStages = ['mode_select', 'prologue', 'low_intro', 'low_ending', 'encyclopedia'];
  if (hiddenStages.includes(state.currentStage)) return null;
  if (state.currentStage === 'stage-6') return null;

  const isHighGrade = state.gradeMode === 'high_grade';

  // Calculate average affinity for high grade
  const avgStat = Math.round((state.stats.understanding + state.stats.trust + state.stats.communication + state.stats.patience) / 4);

  const activeToolData = activeTool ? TOOLS[activeTool] : null;
  const activeToolImg = activeTool ? (ITEM_IMAGES as Record<string, string>)[activeTool] : null;

  return (
    <>
      {/* Affinity Display */}
      <div className="heart-display animate-fade-in-up">
        {isHighGrade ? (
          <>
            <Icon name="star" size={20} alt="별" />
            <span style={{ fontWeight: 800, color: '#334155' }}>관계 지수: {avgStat}</span>
          </>
        ) : (
          <>
            <Icon name="heart" size={20} alt="하트" />
            <span style={{ fontWeight: 800, color: '#334155' }}>하트: {state.hearts}</span>
          </>
        )}
      </div>

      {/* Tools / Inventory Display */}
      {state.inventory.length > 0 && (
        <div style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 999,
          display: 'flex',
          gap: 12,
          flexDirection: 'row-reverse'
        }}>
          {state.inventory.map(toolId => {
            const tool = TOOLS[toolId];
            if (!tool) return null;
            // 자체 제작 아이템 PNG (ITEM_IMAGES)에서 도구 이미지를 가져옵니다.
            const toolImg = (ITEM_IMAGES as Record<string, string>)[toolId];
            if (!toolImg) return null;

            return (
              <button
                key={toolId}
                type="button"
                aria-label={`${tool.name} 설명 보기`}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveTool(toolId);
                }}
                style={{
                  width: 52, height: 52, borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(8px)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
                  border: '2px solid rgba(99,102,241,0.25)',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  padding: 0,
                  transition: 'transform 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                <img
                  src={toolImg}
                  alt={tool.name}
                  style={{ width: 38, height: 38, objectFit: 'contain' }}
                  draggable={false}
                />
              </button>
            );
          })}
        </div>
      )}

      {/* ===== Item Detail Popup ===== */}
      {activeToolData && activeToolImg && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${activeToolData.name} 설명`}
          onClick={() => setActiveTool(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            background: 'rgba(2, 6, 23, 0.68)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
              borderRadius: 24,
              padding: '32px 28px 28px',
              maxWidth: 420,
              width: '100%',
              boxShadow: '0 24px 60px rgba(0,0,0,0.45)',
              border: '1px solid rgba(99,102,241,0.25)',
              animation: 'successScale 0.25s ease',
            }}
          >
            {/* 닫기 버튼 */}
            <button
              type="button"
              onClick={() => setActiveTool(null)}
              aria-label="팝업 닫기"
              style={{
                position: 'absolute',
                top: 12,
                right: 12,
                width: 36,
                height: 36,
                borderRadius: '50%',
                border: '1px solid rgba(15,23,42,0.1)',
                background: 'rgba(241,245,249,0.95)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#e2e8f0';
                e.currentTarget.style.transform = 'rotate(90deg)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(241,245,249,0.95)';
                e.currentTarget.style.transform = 'rotate(0deg)';
              }}
            >
              <Icon name="close" size={16} alt="닫기" />
            </button>

            {/* 아이템 아이콘 */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: 16,
            }}>
              <div style={{
                width: 96,
                height: 96,
                borderRadius: 24,
                background: `linear-gradient(135deg, ${activeToolData.color}22, ${activeToolData.color}0a)`,
                border: `2px solid ${activeToolData.color}55`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 8px 24px ${activeToolData.color}33`,
              }}>
                <img
                  src={activeToolImg}
                  alt={activeToolData.name}
                  style={{ width: 70, height: 70, objectFit: 'contain' }}
                  draggable={false}
                />
              </div>
            </div>

            <h3 style={{
              fontSize: 20,
              fontWeight: 900,
              textAlign: 'center',
              color: '#1e293b',
              marginBottom: 10,
              letterSpacing: '-0.3px',
            }}>
              {activeToolData.name}
            </h3>

            <p style={{
              fontSize: 15,
              lineHeight: 1.65,
              color: '#475569',
              textAlign: 'center',
              wordBreak: 'keep-all',
              marginBottom: 22,
              fontWeight: 600,
            }}>
              {activeToolData.desc}
            </p>

            <button
              type="button"
              onClick={() => setActiveTool(null)}
              style={{
                width: '100%',
                padding: '14px 20px',
                borderRadius: 14,
                border: 'none',
                background: `linear-gradient(135deg, ${activeToolData.color}, #6366f1)`,
                color: 'white',
                fontSize: 15,
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 8px 20px rgba(99,102,241,0.3)',
                transition: 'transform 0.15s ease',
                fontFamily: "'Nanum Gothic', sans-serif",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </>
  );
}
