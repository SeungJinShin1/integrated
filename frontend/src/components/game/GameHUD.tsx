'use client';

import { useGame } from '@/contexts/GameContext';
import { TOOLS } from '@/data/gameData';
import { FaHeart, FaStar } from 'react-icons/fa6';
import * as Icons from 'react-icons/fa6';
import { useState } from 'react';

export default function GameHUD() {
  const { state } = useGame();
  const [hoveredTool, setHoveredTool] = useState<string | null>(null);

  // Do not show HUD on mode select, intro, or lab
  const hiddenStages = ['mode_select', 'prologue', 'low_intro', 'low_ending', 'encyclopedia'];
  if (hiddenStages.includes(state.currentStage)) return null;
  if (state.currentStage === 'stage-6') return null;

  const isHighGrade = state.gradeMode === 'high_grade';
  
  // Calculate average affinity for high grade
  const avgStat = Math.round((state.stats.understanding + state.stats.trust + state.stats.communication + state.stats.patience) / 4);

  return (
    <>
      {/* Affinity Display */}
      <div className="heart-display animate-fade-in-up">
        {isHighGrade ? (
          <>
            <FaStar style={{ color: '#f59e0b', fontSize: 18 }} />
            <span style={{ fontWeight: 800, color: '#334155' }}>관계 지수: {avgStat}</span>
          </>
        ) : (
          <>
            <FaHeart style={{ color: '#ec4899', fontSize: 18 }} />
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
            // Get icon component dynamically from fa6
            const IconComponent = (Icons as any)[tool.icon] || Icons.FaStar;

            return (
              <div 
                key={toolId}
                style={{ position: 'relative' }}
                onMouseEnter={() => setHoveredTool(toolId)}
                onMouseLeave={() => setHoveredTool(null)}
              >
                <div style={{
                  width: 48, height: 48, borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(8px)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                  border: '2px solid rgba(99,102,241,0.2)',
                  cursor: 'pointer',
                  color: '#4f46e5',
                  fontSize: 20,
                  transition: 'transform 0.2s'
                }}
                className="hover:scale-110"
                >
                  <IconComponent />
                </div>

                {/* Tooltip */}
                {hoveredTool === toolId && (
                  <div className="animate-fade-in-up" style={{
                    position: 'absolute',
                    bottom: '100%',
                    right: 0,
                    marginBottom: 12,
                    background: 'rgba(10,15,30,0.95)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: 16,
                    padding: 16,
                    width: 260,
                    color: 'white',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                    pointerEvents: 'none'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <IconComponent style={{ color: '#a855f7' }} />
                      <div style={{ fontWeight: 800, fontSize: 14 }}>{tool.name}</div>
                    </div>
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', lineHeight: 1.5, wordBreak: 'keep-all' }}>
                      {tool.desc}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
