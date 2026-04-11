'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGame } from '@/contexts/GameContext';
import TopNavBar from '@/components/layout/TopNavBar';
import { LOW_NPC_IMAGES, NPC_IMAGES, BG_IMAGES, LOW_BG_IMAGES } from '@/data/assetMap';

const DEFAULT_NAMES = { female: '승주', male: '성민' } as const;

export default function CharacterCreationPage() {
  const router = useRouter();
  const { state, dispatch } = useGame();
  const [gender, setGender] = useState<'female' | 'male'>('female');
  const [name, setName] = useState('');
  const [touched, setTouched] = useState(false);

  // Guard: must have a grade mode set; otherwise return to mode select
  useEffect(() => {
    if (!state.gradeMode) {
      router.replace('/mode');
    }
  }, [state.gradeMode, router]);

  const isLow = state.gradeMode === 'low_grade';

  // When gender changes, sync the placeholder/default name unless user has typed
  useEffect(() => {
    if (!touched) setName(DEFAULT_NAMES[gender]);
  }, [gender, touched]);

  const previewImage = isLow
    ? LOW_NPC_IMAGES[gender].default
    : NPC_IMAGES[gender].default;

  const bgImage = isLow ? LOW_BG_IMAGES.intro : BG_IMAGES.classroom;

  const handleStart = () => {
    const finalName = name.trim() || DEFAULT_NAMES[gender];
    dispatch({ type: 'SET_NPC', payload: { name: finalName, gender } });
    if (isLow) {
      dispatch({ type: 'SET_STAGE', payload: 'low_stage1' });
      router.push('/low/episode/1');
    } else {
      router.push('/high');
    }
  };

  return (
    <>
      <TopNavBar />
      <div className="game-area" style={{ position: 'relative', overflow: 'auto' }}>
        {/* Background */}
        <img
          src={bgImage}
          alt="배경"
          style={{
            position: 'fixed',
            top: 'var(--nav-height)',
            left: 0,
            right: 0,
            bottom: 0,
            width: '100%',
            height: 'calc(100% - var(--nav-height))',
            objectFit: 'cover',
            zIndex: 0,
          }}
        />
        <div
          style={{
            position: 'fixed',
            top: 'var(--nav-height)',
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15,23,42,0.55)',
            zIndex: 1,
          }}
        />

        <div
          style={{
            position: 'relative',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100%',
            padding: 24,
          }}
        >
          <div
            style={{
              background: 'rgba(255,255,255,0.96)',
              backdropFilter: 'blur(20px)',
              borderRadius: 28,
              padding: '36px 32px',
              maxWidth: 560,
              width: '100%',
              boxShadow: '0 24px 60px rgba(0,0,0,0.35)',
              border: '1px solid rgba(255,255,255,0.4)',
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: '#1e293b', marginBottom: 6 }}>
                🤝 함께할 친구를 골라주세요
              </h1>
              <p style={{ fontSize: 14, color: '#64748b' }}>
                친구의 모습과 이름을 정하고 모험을 시작해요
              </p>
            </div>

            {/* Gender selection cards */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 16,
                marginBottom: 24,
              }}
            >
              {(['female', 'male'] as const).map((g) => {
                const selected = gender === g;
                const img = isLow ? LOW_NPC_IMAGES[g].default : NPC_IMAGES[g].default;
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g)}
                    style={{
                      background: selected ? '#eef2ff' : '#f8fafc',
                      border: selected ? '3px solid #6366f1' : '2px solid #e2e8f0',
                      borderRadius: 20,
                      padding: 16,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      transform: selected ? 'translateY(-2px)' : 'translateY(0)',
                      boxShadow: selected
                        ? '0 12px 28px rgba(99,102,241,0.25)'
                        : '0 4px 12px rgba(0,0,0,0.05)',
                    }}
                  >
                    <div
                      style={{
                        width: '100%',
                        height: 160,
                        borderRadius: 14,
                        background: selected ? '#ffffff' : '#f1f5f9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        marginBottom: 10,
                      }}
                    >
                      <img
                        src={img}
                        alt={g === 'female' ? '여자 친구' : '남자 친구'}
                        style={{ height: '100%', objectFit: 'contain' }}
                      />
                    </div>
                    <p
                      style={{
                        fontSize: 16,
                        fontWeight: 800,
                        color: selected ? '#4338ca' : '#475569',
                        margin: 0,
                      }}
                    >
                      {g === 'female' ? '👧 여자 친구' : '👦 남자 친구'}
                    </p>
                    <p
                      style={{
                        fontSize: 12,
                        color: selected ? '#6366f1' : '#94a3b8',
                        marginTop: 2,
                      }}
                    >
                      기본 이름 · {DEFAULT_NAMES[g]}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Name input */}
            <label
              style={{
                display: 'block',
                fontSize: 14,
                fontWeight: 700,
                color: '#475569',
                marginBottom: 8,
              }}
            >
              친구의 이름
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setTouched(true);
                setName(e.target.value);
              }}
              maxLength={10}
              placeholder={DEFAULT_NAMES[gender]}
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: 14,
                border: '2px solid #e2e8f0',
                fontSize: 16,
                fontWeight: 600,
                color: '#1e293b',
                outline: 'none',
                transition: 'border-color 0.2s',
                fontFamily: "'Nanum Gothic', sans-serif",
              }}
              onFocus={(e) => (e.target.style.borderColor = '#6366f1')}
              onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
            />
            <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 6 }}>
              비워두면 기본 이름 「{DEFAULT_NAMES[gender]}」(이)로 시작해요.
            </p>

            <button
              type="button"
              onClick={handleStart}
              style={{
                width: '100%',
                marginTop: 24,
                padding: 18,
                borderRadius: 16,
                border: 'none',
                background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                color: 'white',
                fontSize: 17,
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 12px 32px rgba(99,102,241,0.35)',
                transition: 'transform 0.15s',
                fontFamily: "'Nanum Gothic', sans-serif",
              }}
              onMouseEnter={(e) => ((e.target as HTMLElement).style.transform = 'translateY(-2px)')}
              onMouseLeave={(e) => ((e.target as HTMLElement).style.transform = 'translateY(0)')}
            >
              🚀 모험 시작하기
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
