'use client';

import { DialogueData } from '@/types';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useGame } from '@/contexts/GameContext';

interface DialogueBoxProps {
  speaker: string;
  text: string;
  choices?: DialogueData['choices'];
  onNext?: () => void;
  npcName?: string;
  playerName?: string;
  characterImage?: string;
  characterPosition?: 'left' | 'right';
  /** 캐릭터 스프라이트 크기 배율. peer/무리처럼 피사체가 작은 이미지에 1.4~1.6 사용. */
  characterScale?: number;
  enableTTS?: boolean;
}

type Segment = { text: string; highlight: boolean };

function parseSegments(text: string): Segment[] {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts
    .map<Segment>(p =>
      p.startsWith('**') && p.endsWith('**')
        ? { text: p.slice(2, -2), highlight: true }
        : { text: p, highlight: false }
    )
    .filter(s => s.text.length > 0);
}

export default function DialogueBox({
  speaker,
  text,
  choices,
  onNext,
  npcName,
  playerName,
  characterImage,
  characterPosition = 'left',
  characterScale = 1,
  enableTTS = true,
}: DialogueBoxProps) {
  const displaySpeaker = speaker === npcName ? `${npcName}` : speaker === playerName ? `${playerName}` : speaker;
  const { state } = useGame();

  // 텍스트를 한 번만 세그먼트로 파싱 → 타이프라이터는 '보이는 글자 수' 기준으로 진행
  // 이렇게 하면 `**` 마커가 한 글자씩 노출되는 일이 없음.
  const segments = useMemo(() => parseSegments(text), [text]);
  const totalVisibleChars = useMemo(
    () => segments.reduce((sum, s) => sum + s.text.length, 0),
    [segments]
  );

  const [visibleCount, setVisibleCount] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const totalRef = useRef(totalVisibleChars);
  totalRef.current = totalVisibleChars;

  useEffect(() => {
    setVisibleCount(0);
    setIsTyping(true);

    // TTS (only for low-grade mode)
    if (enableTTS && !state.isMuted && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/\*\*/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'ko-KR';
      utterance.rate = 1.1;

      if (speaker === '해설') utterance.pitch = 1.2;
      else if (speaker === playerName) utterance.pitch = state.player.gender === 'female' ? 1.4 : 0.8;
      else utterance.pitch = 1.1;

      window.speechSynthesis.speak(utterance);
    }

    let i = 0;
    const interval = setInterval(() => {
      if (i < totalRef.current) {
        i++;
        setVisibleCount(i);
      } else {
        setIsTyping(false);
        clearInterval(interval);
      }
    }, 30);
    return () => {
      clearInterval(interval);
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [text, state.isMuted, speaker, playerName, state.player.gender, enableTTS]);

  const handleClick = () => {
    if (isTyping) {
      // Skip to full text
      setVisibleCount(totalVisibleChars);
      setIsTyping(false);
      return;
    }
    if (!choices && onNext) onNext();
  };

  // 세그먼트 단위로 렌더. visibleCount 만큼만 남기고 잘라서 보여줌.
  const renderSegments = () => {
    let remaining = visibleCount;
    const output: React.ReactNode[] = [];
    for (let i = 0; i < segments.length; i++) {
      if (remaining <= 0) break;
      const seg = segments[i];
      const shown = seg.text.slice(0, remaining);
      remaining -= seg.text.length;
      if (seg.highlight) {
        output.push(
          <span key={i} className="highlight">
            {shown}
          </span>
        );
      } else {
        output.push(<span key={i}>{shown}</span>);
      }
    }
    return output;
  };

  // 피사체가 캔버스 안에서 작은 peer/무리 이미지 보정용 배율.
  // 컨테이너에 transform 적용 → 기존 breathing 애니메이션(이미지의 transform)과 충돌하지 않음.
  const isScaled = characterScale !== 1;
  const characterContainerStyle = isScaled
    ? {
        transform: `scale(${characterScale})`,
        transformOrigin: characterPosition === 'right' ? 'bottom right' : 'bottom left',
      }
    : undefined;
  // peer/무리 이미지는 PNG 캔버스 내부 여백이 커서 object-fit:contain으로 가운데 정렬하면
  // 피사체가 대화창과 멀어져 보임. 바닥에 붙도록 object-position을 아래로 당김.
  const characterImgStyle: React.CSSProperties | undefined = isScaled
    ? { objectPosition: 'bottom' }
    : undefined;

  return (
    <div className="dialogue-container animate-fade-in">
      {/* Integrated character + dialogue layout */}
      <div className="dialogue-integrated">
        {/* Character overlapping the dialogue box */}
        {characterImage && (
          <div
            className={`dialogue-character ${characterPosition === 'right' ? 'dialogue-character-right' : ''}`}
            style={characterContainerStyle}
          >
            <img
              src={characterImage}
              alt={displaySpeaker}
              className="dialogue-character-img"
              style={characterImgStyle}
            />
          </div>
        )}

        {/* Dialogue box */}
        <div className="dialogue-box" onClick={handleClick}>
          {/* Speaker name badge on top of dialogue box */}
          <div className="dialogue-speaker">{displaySpeaker}</div>

          <div className="dialogue-text">
            {renderSegments()}
            {isTyping && <span className="typing-cursor">|</span>}
          </div>

          {choices && choices.length > 0 && !isTyping && (
            <div className="choices-container">
              {choices.map((choice, idx) => (
                <button
                  key={idx}
                  className="choice-btn"
                  onClick={(e) => { e.stopPropagation(); choice.action(); }}
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  {choice.text}
                </button>
              ))}
            </div>
          )}

          {!choices && onNext && !isTyping && (
            <div className="dialogue-next">▼ 클릭</div>
          )}
        </div>
      </div>
    </div>
  );
}
