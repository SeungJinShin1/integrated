'use client';

import { useEffect, useRef } from 'react';
import { useGame } from '@/contexts/GameContext';

/**
 * Custom hook that speaks the given text using Web Speech API (TTS).
 * Automatically cancels previous speech and speaks new text when it changes.
 * Respects the global mute state from GameContext.
 */
export function useTTS(text: string | null | undefined) {
  const { state } = useGame();
  const prevTextRef = useRef<string | null>(null);

  useEffect(() => {
    if (!text || state.isMuted) return;
    if (text === prevTextRef.current) return;
    prevTextRef.current = text;

    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();

    const cleanText = text.replace(/\*\*/g, '').replace(/[🎉🌱💖✨🎧💡🏅🚨⏳😰🎨🧩💬🖐🎗️⛔🚂💥🦜🐾🌲🎶]/gu, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'ko-KR';
    utterance.rate = 0.95;
    utterance.pitch = 1.2;

    window.speechSynthesis.speak(utterance);

    return () => {
      window.speechSynthesis.cancel();
    };
  }, [text, state.isMuted]);
}
