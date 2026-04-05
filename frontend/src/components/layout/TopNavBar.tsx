'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useGame } from '@/contexts/GameContext';
import { FaHouse, FaExpand, FaVolumeXmark, FaVolumeHigh, FaRightFromBracket, FaUsers, FaMap, FaRotateLeft } from 'react-icons/fa6';
import { useCallback, useEffect, useState } from 'react';
import { STAGE_NAMES } from '@/data/gameData';
import GameHUD from '@/components/game/GameHUD';

export default function TopNavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { state, toggleMute, resetGame } = useGame();
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Hide nav on intro, start, and auth pages
  const hiddenPaths = ['/', '/start', '/auth/login', '/auth/register', '/auth/find'];
  if (hiddenPaths.includes(pathname)) return null;

  const currentTitle = STAGE_NAMES[state.currentStage] || '우리 반 보물찾기';

  const handleHome = () => {
    if (confirm('모드 선택 화면으로 돌아가시겠습니까?')) {
      router.push('/mode');
    }
  };

  const handleRestart = () => {
    if (confirm('게임을 처음부터 다시 시작하시겠습니까?\n(모든 진행 상황이 초기화됩니다)')) {
      resetGame();
      router.push('/start');
    }
  };

  const handleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // F11 key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F11') {
        e.preventDefault();
        handleFullscreen();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    const handleFSChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFSChange);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('fullscreenchange', handleFSChange);
    };
  }, [handleFullscreen]);

  const handleLogout = () => {
    if (confirm('로그아웃 하시겠습니까?')) {
      logout();
      router.push('/start');
    }
  };

  return (
    <>
    <nav className="top-nav">
      <div className="nav-group">
        <button className="nav-btn" onClick={handleHome} title="모드 선택">
          <FaHouse />
        </button>
        <button className="nav-btn" onClick={handleRestart} title="다시 시작 (초기화)">
          <FaRotateLeft />
        </button>
        {state.gradeMode === 'high_grade' && (
          <button className="nav-btn" onClick={() => router.push('/high')} title="월드맵">
            <FaMap />
          </button>
        )}
      </div>

      <span className="nav-title">{currentTitle}</span>

      <div className="nav-group">
        <button className="nav-btn" onClick={handleFullscreen} title={isFullscreen ? '전체화면 해제 (F11)' : '전체보기 (F11)'}>
          <FaExpand />
        </button>
        <button className="nav-btn" onClick={toggleMute} title={state.isMuted ? '소리 켜기' : '음소거'}>
          {state.isMuted ? <FaVolumeXmark /> : <FaVolumeHigh />}
        </button>
        {user?.role === 'teacher' && (
          <button className="nav-btn" onClick={() => router.push('/teacher')} title="학생 모니터링">
            <FaUsers />
          </button>
        )}
        {user && (
          <button className="nav-btn" onClick={handleLogout} title="로그아웃">
            <FaRightFromBracket />
          </button>
        )}
      </div>
    </nav>
    <GameHUD />
    </>
  );
}
