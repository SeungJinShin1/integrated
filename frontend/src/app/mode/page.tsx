'use client';

import { useRouter } from 'next/navigation';
import { useGame } from '@/contexts/GameContext';
import { useAuth } from '@/contexts/AuthContext';
import Icon from '@/components/ui/Icon';
import TopNavBar from '@/components/layout/TopNavBar';

export default function ModeSelectPage() {
  const router = useRouter();
  const { setGradeMode, dispatch } = useGame();
  const { user } = useAuth();

  const handleLowGrade = () => {
    dispatch({ type: 'SET_PLAYER', payload: { name: '나', gender: 'male' } });
    setGradeMode('low_grade');
    router.push('/character');
  };

  const handleHighGrade = () => {
    // 이미 로그인된 교사/학생은 로그인 건너뛰고 바로 캐릭터 선택
    if (user) {
      setGradeMode('high_grade');
      router.push('/character');
    } else {
      router.push('/auth/login');
    }
  };

  return (
    <>
      <TopNavBar />
      <div className="game-area" style={{
        background: 'linear-gradient(135deg, #0f172a, #1e1b4b)',
      }}>
        <div style={{
          minHeight: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'clamp(16px, 3vw, 24px)',
          boxSizing: 'border-box',
        }}>
        <div style={{
          background: 'var(--bg-card)', borderRadius: 28,
          padding: 'clamp(28px, 4vw, 48px) clamp(22px, 3vw, 40px)',
          maxWidth: 700, width: '100%',
          boxShadow: '0 24px 48px rgba(0,0,0,0.3)',
        }}>
          <div style={{ textAlign: 'center', marginBottom: 'clamp(24px, 3vw, 40px)' }}>
            <h1 style={{ fontSize: 'clamp(22px, 3vw, 28px)', fontWeight: 800, color: '#1e293b', marginBottom: 8 }}>
              히든피스: 우리 반 보물찾기
            </h1>
            <p style={{ color: '#64748b', fontSize: 'clamp(13px, 1.4vw, 15px)' }}>학년에 맞는 모드를 선택해 주세요</p>
          </div>

          <div style={{
            display: 'grid',
            // 좁은 태블릿 세로에서는 자동으로 1열로 스택
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 20,
          }}>
            {/* 저학년 */}
            <div
              className="mode-card"
              onClick={handleLowGrade}
              style={{
                borderColor: '#86efac', background: '#f0fdf4',
              }}
            >
              <div style={{
                width: 72, height: 72, borderRadius: '50%',
                background: '#bbf7d0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px',
              }}>
                <Icon name="seedling" size={42} alt="새싹" />
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: '#166534', marginBottom: 8 }}>히든피스 새싹</h2>
              <p style={{ color: '#16a34a', fontWeight: 600, fontSize: 14, marginBottom: 4 }}>초등학교 1~2학년</p>
              <p style={{ fontSize: 13, color: '#4ade80', marginTop: 8 }}>
                터치와 기다림을 통해<br />친구의 마음을 이해해 보아요
              </p>
            </div>

            {/* 고학년 */}
            <div
              className="mode-card"
              onClick={handleHighGrade}
              style={{
                borderColor: '#a5b4fc', background: '#eef2ff',
              }}
            >
              <div style={{
                width: 72, height: 72, borderRadius: '50%',
                background: '#c7d2fe',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px',
              }}>
                <Icon name="hiddenpiece" size={42} alt="히든피스 탐험가" />
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: '#3730a3', marginBottom: 8 }}>히든피스 탐험가</h2>
              <p style={{ color: '#4f46e5', fontWeight: 600, fontSize: 14, marginBottom: 4 }}>초등학교 3~6학년</p>
              <p style={{ fontSize: 13, color: '#818cf8', marginTop: 8 }}>
                도구를 활용하고 친구와 협력하여<br />빛나는 우리 반을 완성해 보아요
              </p>
            </div>
          </div>
        </div>
        </div>
      </div>
    </>
  );
}
