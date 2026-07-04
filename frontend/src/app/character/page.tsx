'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGame } from '@/contexts/GameContext';
import TopNavBar from '@/components/layout/TopNavBar';
import { LOW_NPC_IMAGES, NPC_IMAGES, PLAYER_IMAGES, BG_IMAGES, LOW_BG_IMAGES } from '@/data/assetMap';

const DEFAULT_NPC_NAMES = { female: '승주', male: '성민' } as const;
const DEFAULT_PLAYER_NAME = '나';

export default function CharacterCreationPage() {
  const router = useRouter();
  const { state, dispatch, registerStudent } = useGame();
  const [npcGender, setNpcGender] = useState<'female' | 'male'>('female');
  const [playerGender, setPlayerGender] = useState<'female' | 'male'>('female');
  const [playerName, setPlayerName] = useState(DEFAULT_PLAYER_NAME);
  const [npcName, setNpcName] = useState('');
  const [npcNameTouched, setNpcNameTouched] = useState(false);

  // Guard: must have a grade mode set; otherwise return to mode select
  useEffect(() => {
    if (!state.gradeMode) {
      router.replace('/mode');
    }
  }, [state.gradeMode, router]);

  const isLow = state.gradeMode === 'low_grade';

  // When NPC gender changes, sync the placeholder/default name unless user has typed
  useEffect(() => {
    if (!npcNameTouched) setNpcName(DEFAULT_NPC_NAMES[npcGender]);
  }, [npcGender, npcNameTouched]);

  const bgImage = isLow ? LOW_BG_IMAGES.intro : BG_IMAGES.classroom;

  const handleStart = () => {
    const finalPlayerName = playerName.trim() || DEFAULT_PLAYER_NAME;
    const finalNpcName = npcName.trim() || DEFAULT_NPC_NAMES[npcGender];
    dispatch({ type: 'SET_PLAYER', payload: { name: finalPlayerName, gender: playerGender } });
    dispatch({ type: 'SET_NPC', payload: { name: finalNpcName, gender: npcGender } });
    // 인증코드로 로그인한 학생을 교사 대시보드에 즉시 등록
    registerStudent(finalPlayerName);
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
      <div
        className="game-area"
        style={{
          // 배경을 CSS 배경으로 깔아두어 콘텐츠와 별도로 렌더링
          // → 콘텐츠가 뷰포트보다 길면 .game-area 의 overflow-y:auto 가 동작하고,
          //   배경은 자연스럽게 제자리에 남습니다.
          background: `linear-gradient(rgba(15,23,42,0.55), rgba(15,23,42,0.55)), url("${encodeURI(bgImage)}") center/cover no-repeat`,
        }}
      >
        <div
          style={{
            position: 'relative',
            zIndex: 10,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            minHeight: '100%',
            // 세로가 짧은 태블릿 가로 모드에서도 카드가 잘리지 않게 위 여백 줄이고 스크롤 허용
            padding: 'clamp(16px, 3vw, 24px)',
            paddingTop: 'clamp(20px, 4vh, 48px)',
            paddingBottom: 'clamp(20px, 4vh, 48px)',
          }}
        >
          <div
            style={{
              background: 'rgba(255,255,255,0.96)',
              backdropFilter: 'blur(20px)',
              borderRadius: 28,
              padding: 'clamp(22px, 3vw, 36px) clamp(20px, 3vw, 32px)',
              maxWidth: 560,
              width: '100%',
              boxShadow: '0 24px 60px rgba(0,0,0,0.35)',
              border: '1px solid rgba(255,255,255,0.4)',
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: 'clamp(16px, 2.5vw, 24px)' }}>
              <h1 style={{ fontSize: 'clamp(20px, 2.6vw, 26px)', fontWeight: 800, color: '#1e293b', marginBottom: 6 }}>
                캐릭터를 만들어 주세요
              </h1>
              <p style={{ fontSize: 'clamp(12px, 1.3vw, 14px)', color: '#64748b' }}>
                {isLow ? '함께할 친구를 골라 모험을 시작해요' : '「나」와 함께할 친구를 고르고 모험을 시작해요'}
              </p>
            </div>

            {/* 나 (player) gender selection — 고학년에서만 노출
                저학년은 '나' 스프라이트가 없고 학습 흐름상 친구만 선택합니다. */}
            {!isLow && (
              <>
                <p style={{ fontSize: 13, fontWeight: 800, color: '#475569', marginBottom: 10, letterSpacing: 0.5 }}>
                  ① 나의 모습
                </p>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 12,
                    marginBottom: 22,
                  }}
                >
                  {(['female', 'male'] as const).map((g) => {
                    const selected = playerGender === g;
                    const img = PLAYER_IMAGES[g].talk;
                    return (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setPlayerGender(g)}
                        style={{
                          background: selected ? '#fef3c7' : '#f8fafc',
                          border: selected ? '3px solid #f59e0b' : '2px solid #e2e8f0',
                          borderRadius: 18,
                          padding: 12,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          transform: selected ? 'translateY(-2px)' : 'translateY(0)',
                          boxShadow: selected
                            ? '0 10px 24px rgba(245,158,11,0.25)'
                            : '0 4px 12px rgba(0,0,0,0.05)',
                        }}
                      >
                        <div
                          style={{
                            width: '100%',
                            height: 'clamp(104px, 13vw, 140px)',
                            borderRadius: 12,
                            background: selected ? '#ffffff' : '#f1f5f9',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                            marginBottom: 8,
                          }}
                        >
                          <img
                            src={img}
                            alt={g === 'female' ? '나 (여자)' : '나 (남자)'}
                            style={{ height: '100%', objectFit: 'contain' }}
                          />
                        </div>
                        <p
                          style={{
                            fontSize: 14,
                            fontWeight: 800,
                            color: selected ? '#b45309' : '#475569',
                            margin: 0,
                          }}
                        >
                          {g === 'female' ? '나 · 여자' : '나 · 남자'}
                        </p>
                      </button>
                    );
                  })}
                </div>

              </>
            )}

            {/* Player name input — 저학년/고학년 공통.
                여기 입력한 이름이 선생님 대시보드에 학생 이름(ID)으로 표시됩니다. */}
            <label
              style={{
                display: 'block',
                fontSize: 13,
                fontWeight: 800,
                color: '#475569',
                marginBottom: 8,
                letterSpacing: 0.5,
              }}
            >
              {isLow ? '① 나의 이름' : '② 나의 이름'}
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              maxLength={10}
              placeholder={DEFAULT_PLAYER_NAME}
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
                marginBottom: 4,
              }}
              onFocus={(e) => (e.target.style.borderColor = '#f59e0b')}
              onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
            />
            <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 6, marginBottom: 22 }}>
              입력한 이름은 선생님 화면에 표시돼요. 비워두면 「{DEFAULT_PLAYER_NAME}」(으)로 시작해요.
            </p>

            {/* NPC (친구) gender selection */}
            <p style={{ fontSize: 13, fontWeight: 800, color: '#475569', marginBottom: 10, letterSpacing: 0.5 }}>
              {isLow ? '② 함께할 친구' : '③ 함께할 친구'}
            </p>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 12,
                marginBottom: 22,
              }}
            >
              {(['female', 'male'] as const).map((g) => {
                const selected = npcGender === g;
                const img = isLow ? LOW_NPC_IMAGES[g].default : NPC_IMAGES[g].default;
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setNpcGender(g)}
                    style={{
                      background: selected ? '#eef2ff' : '#f8fafc',
                      border: selected ? '3px solid #6366f1' : '2px solid #e2e8f0',
                      borderRadius: 18,
                      padding: 12,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      transform: selected ? 'translateY(-2px)' : 'translateY(0)',
                      boxShadow: selected
                        ? '0 10px 24px rgba(99,102,241,0.25)'
                        : '0 4px 12px rgba(0,0,0,0.05)',
                    }}
                  >
                    <div
                      style={{
                        width: '100%',
                        height: 'clamp(104px, 13vw, 140px)',
                        borderRadius: 12,
                        background: selected ? '#ffffff' : '#f1f5f9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        marginBottom: 8,
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
                        fontSize: 14,
                        fontWeight: 800,
                        color: selected ? '#4338ca' : '#475569',
                        margin: 0,
                      }}
                    >
                      {g === 'female' ? '여자 친구' : '남자 친구'}
                    </p>
                    <p
                      style={{
                        fontSize: 11,
                        color: selected ? '#6366f1' : '#94a3b8',
                        marginTop: 2,
                      }}
                    >
                      기본 이름 · {DEFAULT_NPC_NAMES[g]}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* NPC Name input */}
            <label
              style={{
                display: 'block',
                fontSize: 13,
                fontWeight: 800,
                color: '#475569',
                marginBottom: 8,
                letterSpacing: 0.5,
              }}
            >
              {isLow ? '③ 친구의 이름' : '④ 친구의 이름'}
            </label>
            <input
              type="text"
              value={npcName}
              onChange={(e) => {
                setNpcNameTouched(true);
                setNpcName(e.target.value);
              }}
              maxLength={10}
              placeholder={DEFAULT_NPC_NAMES[npcGender]}
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
              비워두면 기본 이름 「{DEFAULT_NPC_NAMES[npcGender]}」(이)로 시작해요.
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
              모험 시작하기
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
