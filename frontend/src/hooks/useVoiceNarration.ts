'use client';

import { useEffect, useRef } from 'react';
import { useGame } from '@/contexts/GameContext';

/**
 * 미리 녹음된 음성 파일을 재생하는 훅.
 *
 * - src 가 바뀔 때마다 이전 오디오를 중지하고 새 파일을 재생합니다.
 * - 재생 시작 시 'bgm-duck' 이벤트를 발행하여 BGMPlayer 볼륨을 낮추고,
 *   재생 종료 시 'bgm-restore' 이벤트로 원래 볼륨을 복원합니다.
 * - GameContext 의 isMuted 상태를 존중합니다.
 *
 * useTTS (Web Speech API) 를 대체합니다.
 */
export function useVoiceNarration(src: string | null) {
  const { state } = useGame();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const prevSrcRef = useRef<string | null>(null);

  useEffect(() => {
    // 음소거 상태이거나 src 가 없으면 재생 중지
    if (state.isMuted || !src) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.onended = null;
        audioRef.current = null;
        window.dispatchEvent(new Event('bgm-restore'));
      }
      return;
    }

    // 같은 파일이면 다시 재생하지 않음
    if (src === prevSrcRef.current) return;
    prevSrcRef.current = src;

    // 이전 재생 중지
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.onended = null;
    }

    const el = new Audio(src);
    audioRef.current = el;
    el.volume = 1.0;

    // BGM 볼륨 낮추기
    window.dispatchEvent(new Event('bgm-duck'));

    el.play().catch(() => {});

    el.onended = () => {
      window.dispatchEvent(new Event('bgm-restore'));
      audioRef.current = null;
    };
  }, [src, state.isMuted]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.onended = null;
        audioRef.current = null;
        window.dispatchEvent(new Event('bgm-restore'));
      }
    };
  }, []);
}
