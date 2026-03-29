'use client';

import { DialogueData } from '@/types';

interface DialogueBoxProps {
  speaker: string;
  text: string;
  choices?: DialogueData['choices'];
  onNext?: () => void;
  npcName?: string;
  playerName?: string;
}

export default function DialogueBox({ speaker, text, choices, onNext, npcName, playerName }: DialogueBoxProps) {
  const displaySpeaker = speaker === npcName ? `${npcName}` : speaker === playerName ? `${playerName}` : speaker;

  const handleClick = () => {
    if (!choices && onNext) onNext();
  };

  // Parse text for highlight keywords
  const renderText = (t: string) => {
    // Highlight text between ** markers or specific patterns
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
      <div className="dialogue-box" onClick={handleClick}>
        <div className="dialogue-speaker">{displaySpeaker}</div>
        <div className="dialogue-text">{renderText(text)}</div>

        {choices && choices.length > 0 && (
          <div className="choices-container">
            {choices.map((choice, idx) => (
              <button key={idx} className="choice-btn" onClick={(e) => { e.stopPropagation(); choice.action(); }}>
                {choice.text}
              </button>
            ))}
          </div>
        )}

        {!choices && onNext && (
          <div className="dialogue-next">▼ 클릭</div>
        )}
      </div>
    </div>
  );
}
