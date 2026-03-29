'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGame } from '@/contexts/GameContext';
import TopNavBar from '@/components/layout/TopNavBar';
import DialogueBox from '@/components/game/DialogueBox';
import { LOW_BG_IMAGES, getLowNpcImage } from '@/data/assetMap';
import { DialogueData } from '@/types';

export default function LowGradePage() {
  const router = useRouter();
  const { state, dispatch, setGradeMode } = useGame();
  const [step, setStep] = useState(0);
  const [dialogue, setDialogue] = useState<DialogueData | null>({
    speaker: '시스템',
    text: '안녕! 나는 새싹 요원 본부의 연구원이야. 오늘 특별한 친구를 만나러 가볼까?',
    choices: [
      { text: '👧 여자 친구를 만나러 가기', action: () => { dispatch({ type: 'SET_NPC', payload: { name: '승주', gender: 'female' } }); setStep(1); } },
      { text: '👦 남자 친구를 만나러 가기', action: () => { dispatch({ type: 'SET_NPC', payload: { name: '성민', gender: 'male' } }); setStep(1); } },
    ]
  });

  if (step === 1) {
    setGradeMode('low_grade');
    dispatch({ type: 'SET_STAGE', payload: 'low_stage1' });
    router.push('/low/episode/1');
    return null;
  }

  return (
    <>
      <TopNavBar />
      <div className="game-area" style={{ position: 'relative' }}>
        <img src={LOW_BG_IMAGES.intro} alt="새싹요원" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)' }} />

        <div className="stage-header">
          <div className="stage-title">🌱 새싹 요원 본부</div>
          <div className="stage-subtitle">친구를 선택하세요</div>
        </div>

        {dialogue && <DialogueBox {...dialogue} />}
      </div>
    </>
  );
}
