'use client';

import { useRouter } from 'next/navigation';
import { useGame } from '@/contexts/GameContext';
import { FaSeedling, FaUserSecret } from 'react-icons/fa6';
import TopNavBar from '@/components/layout/TopNavBar';

export default function ModeSelectPage() {
  const router = useRouter();
  const { setGradeMode, dispatch } = useGame();

  const handleLowGrade = () => {
    dispatch({ type: 'SET_PLAYER', payload: { name: '나', gender: 'male' } });
    setGradeMode('low_grade');
    router.push('/low');
  };

  const handleHighGrade = () => {
    router.push('/auth/login');
  };

  return (
    <>
      <TopNavBar />
      <div className="game-area" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f172a, #1e1b4b)',
        padding: 24,
      }}>
        <div style={{
          background: 'var(--bg-card)', borderRadius: 28,
          padding: '48px 40px', maxWidth: 700, width: '100%',
          boxShadow: '0 24px 48px rgba(0,0,0,0.3)',
        }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1e293b', marginBottom: 8 }}>
              원팀 프로젝트: 히든 피스
            </h1>
            <p style={{ color: '#64748b', fontSize: 15 }}>당신의 요원 등급을 선택해 주세요</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
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
                background: '#bbf7d0', color: '#16a34a',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 32, margin: '0 auto 16px',
              }}>
                <FaSeedling />
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: '#166534', marginBottom: 8 }}>새싹 요원</h2>
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
                background: '#c7d2fe', color: '#4f46e5',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 32, margin: '0 auto 16px',
              }}>
                <FaUserSecret />
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: '#3730a3', marginBottom: 8 }}>프리즘 요원</h2>
              <p style={{ color: '#4f46e5', fontWeight: 600, fontSize: 14, marginBottom: 4 }}>초등학교 3~6학년</p>
              <p style={{ fontSize: 13, color: '#818cf8', marginTop: 8 }}>
                도구를 활용하고 상호 협력하여<br />특별한 친구와 원팀이 되어보아요
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
