'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useGame } from '@/contexts/GameContext';

/**
 * 전역 배경음악 플레이어.
 *
 * · 단일 <audio> 엘리먼트를 유지하면서 현재 라우트에 맞춰 트랙을 전환합니다.
 * · BGM 은 나레이션/효과음을 해치지 않도록 매우 낮은 볼륨으로 깔리도록 합니다.
 * · 브라우저의 autoplay 정책 때문에 최초 사용자 상호작용(클릭/탭/키)이 있기 전까지는
 *   재생되지 않습니다. 첫 클릭 이후에는 자동으로 재생이 해제되어 이후 라우트 전환 시
 *   끊김 없이 자연스럽게 이어집니다.
 * · 음소거(GameContext.state.isMuted) 상태를 존중합니다.
 */

const BGM_BASE = '/audio/bgm';

// 현재 경로에서 재생할 트랙을 결정합니다. null 이면 재생 중지.
function resolveTrack(pathname: string): string | null {
  if (!pathname) return null;

  // 고학년 스테이지: /high/stage/1 ~ /high/stage/6
  const stageMatch = pathname.match(/^\/high\/stage\/(\d+)/);
  if (stageMatch) {
    const n = Number(stageMatch[1]);
    if (n === 1) return `${BGM_BASE}/stage1_forest.mp3`;
    if (n === 2) return `${BGM_BASE}/stage2_sensory.mp3`;
    if (n === 3) return `${BGM_BASE}/stage3_train.mp3`;
    if (n === 4) return `${BGM_BASE}/stage4_puzzle.mp3`;
    if (n === 5) return `${BGM_BASE}/stage5_memory.mp3`;
    if (n === 6) return `${BGM_BASE}/stage6_finale.mp3`;
    return null;
  }

  // 6단계 실험실/결과 카드
  if (pathname.startsWith('/high/lab')) return `${BGM_BASE}/stage6_finale.mp3`;

  // 저학년 전 영역
  if (pathname.startsWith('/low')) return `${BGM_BASE}/low_grade.mp3`;

  // 도입부 계열: 루트, 시작, 모드/캐릭터 선택, 로그인, 월드맵
  if (
    pathname === '/' ||
    pathname === '/start' ||
    pathname === '/mode' ||
    pathname === '/character' ||
    pathname.startsWith('/auth') ||
    pathname === '/high'
  ) {
    return `${BGM_BASE}/intro.mp3`;
  }

  // 교사/관리자 페이지에서는 BGM 없음
  return null;
}

const TARGET_VOLUME = 0.12; // BGM 잔잔하게 — 전체 볼륨의 12%
const FADE_MS = 700;

export default function BGMPlayer() {
  const pathname = usePathname();
  const { state } = useGame();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentSrcRef = useRef<string | null>(null);
  const unlockedRef = useRef(false);
  const fadeTimerRef = useRef<number | null>(null);

  // 최초 사용자 상호작용이 일어날 때까지 autoplay 잠금 해제 대기
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const unlock = () => {
      unlockedRef.current = true;
      // 잠금이 해제되는 시점에 이미 로드된 트랙이 있으면 바로 재생
      const el = audioRef.current;
      if (el && currentSrcRef.current && !state.isMuted) {
        el.play().catch(() => {
          // 사용자 제스처가 없었다면 여전히 실패할 수 있음 — 무음 실패는 조용히 무시
        });
      }
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
      window.removeEventListener('touchstart', unlock);
    };

    window.addEventListener('pointerdown', unlock, { once: false });
    window.addEventListener('keydown', unlock, { once: false });
    window.addEventListener('touchstart', unlock, { once: false });

    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
      window.removeEventListener('touchstart', unlock);
    };
    // state.isMuted 변화는 별도 effect 가 처리
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // audio 엘리먼트 초기화 (1회)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const el = new Audio();
    el.loop = true;
    el.preload = 'auto';
    el.volume = 0; // fade-in 용으로 0 부터 시작
    audioRef.current = el;
    return () => {
      if (fadeTimerRef.current) window.clearInterval(fadeTimerRef.current);
      el.pause();
      el.src = '';
      audioRef.current = null;
    };
  }, []);

  // 라우트 변화에 따른 트랙 전환
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;

    const nextSrc = resolveTrack(pathname || '');

    // 변경 없음
    if (nextSrc === currentSrcRef.current) return;

    const applyNew = () => {
      if (!nextSrc) {
        el.pause();
        el.src = '';
        currentSrcRef.current = null;
        return;
      }
      el.src = nextSrc;
      currentSrcRef.current = nextSrc;
      el.volume = 0;
      if (unlockedRef.current && !state.isMuted) {
        el.play()
          .then(() => fadeTo(el, TARGET_VOLUME, FADE_MS))
          .catch(() => {
            // 권한 거부 시에도 에러 출력은 하지 않음 — 다음 클릭에서 재시도됨
          });
      }
    };

    // 기존 트랙을 짧게 페이드아웃한 뒤 교체
    if (currentSrcRef.current) {
      fadeTo(el, 0, FADE_MS / 2, () => {
        el.pause();
        applyNew();
      });
    } else {
      applyNew();
    }
    // state.isMuted 변화는 아래 effect 에서 처리
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // 음소거 토글 반응
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    if (state.isMuted) {
      fadeTo(el, 0, FADE_MS / 2, () => el.pause());
    } else if (currentSrcRef.current && unlockedRef.current) {
      el.play()
        .then(() => fadeTo(el, TARGET_VOLUME, FADE_MS))
        .catch(() => {});
    }
  }, [state.isMuted]);

  return null;
}

// 작은 페이드 헬퍼 — setInterval 로 단순 선형 보간
function fadeTo(
  el: HTMLAudioElement,
  target: number,
  duration: number,
  onDone?: () => void,
) {
  if (typeof window === 'undefined') return;
  const start = el.volume;
  const delta = target - start;
  if (Math.abs(delta) < 0.001 || duration <= 0) {
    el.volume = target;
    onDone?.();
    return;
  }
  const startTime = performance.now();
  const step = () => {
    const now = performance.now();
    const t = Math.min(1, (now - startTime) / duration);
    el.volume = Math.max(0, Math.min(1, start + delta * t));
    if (t < 1) {
      window.requestAnimationFrame(step);
    } else {
      el.volume = target;
      onDone?.();
    }
  };
  window.requestAnimationFrame(step);
}
