'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGame } from '@/contexts/GameContext';

// /low is no longer the entry point — character creation lives at /character.
// Keep this page as a redirect so any old links still land in the right place.
export default function LowGradeRedirect() {
  const router = useRouter();
  const { setGradeMode } = useGame();

  useEffect(() => {
    setGradeMode('low_grade');
    router.replace('/character');
  }, [router, setGradeMode]);

  return null;
}
