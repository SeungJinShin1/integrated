'use client';

import { DialogueData } from '@/types';
import { useEffect, useRef, useState } from 'react';
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
  enableTTS?: boolean;
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
  enableTTS = true,
}: DialogueBoxProps) {
  const displaySpeaker = speaker === npcName ? `${npcName}` : speaker === playerName ? `${playerName}` : speaker;
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const fullTextRef = useRef(text);
  const { state } = useGame();

  // Typewriter effect & TTS
  useEffect(() => {
    fullTextRef.current = text;
    setDisplayedText('');
    setIsTyping(true);

    // TTS (only for low-grade mode)
    if (enableTTS && !state.isMuted && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      // Remove asterisks around text for cleaner speech
      const cleanText = text.replace(/\*\*/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'ko-KR';
      utterance.rate = 1.1;
      
      if (speaker === '시스템') utterance.pitch = 1.2;
      else if (speaker === playerName) utterance.pitch = state.player.gender === 'female' ? 1.4 : 0.8;
      else utterance.pitch = 1.1;

      window.speechSynthesis.speak(utterance);
    }

    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(text.slice(0, i + 1));
        i++;
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
      setDisplayedText(fullTextRef.current);
      setIsTyping(false);
      return;
    }
    if (!choices && onNext) onNext();
  };

  // Parse text for highlight keywords
  const renderText = (t: string) => {
    const parts = t.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <span key={i} className="highlight">{part.slice(2, -2)}</span>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className="dialogue-container animate-fade-in">
      {/* Integrated character + dialogue layout */}
      <div className="dialogue-integrated">
        {/* Character overlapping the dialogue box */}
        {characterImage && (
          <div className={`dialogue-character ${characterPosition === 'right' ? 'dialogue-character-right' : ''}`}>
            <img src={characterImage} alt={displaySpeaker} className="dialogue-character-img" />
            <div className="dialogue-character-name">{displaySpeaker}</div>
          </div>
        )}

        {/* Dialogue box */}
        <div className="dialogue-box" onClick={handleClick}>
          {/* Speaker tag only if no character image */}
          {!characterImage && (
            <div className="dialogue-speaker">{displaySpeaker}</div>
          )}

          <div className="dialogue-text">
            {renderText(displayedText)}
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
