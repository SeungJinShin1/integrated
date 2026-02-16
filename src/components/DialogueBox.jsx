import { useState, useEffect, useRef } from 'react';

export default function DialogueBox({ speaker, text, choices, onNext, npcName, playerName }) {
    const [displayed, setDisplayed] = useState('');
    const [done, setDone] = useState(false);
    const choiceTimerRef = useRef(null);

    const safeText = text || '';

    useEffect(() => {
        setDisplayed('');
        setDone(false);
        if (!safeText) {
            setDone(true);
            return;
        }
        let i = 0;
        let cancelled = false;
        const timer = setInterval(() => {
            if (cancelled) { clearInterval(timer); return; }
            if (i < safeText.length) {
                const ch = safeText.charAt(i);
                setDisplayed(prev => prev + ch);
                i++;
            } else {
                clearInterval(timer);
                setDone(true);
                choiceTimerRef.current = Date.now();
            }
        }, 30);
        return () => { cancelled = true; clearInterval(timer); };
    }, [safeText, speaker]);

    const pName = playerName || '나';
    const speakerColor = speaker === npcName ? 'text-pink-500' : speaker === pName ? 'text-indigo-600' : 'text-slate-500';

    const handleChoice = (choice) => {
        const waited = Date.now() - (choiceTimerRef.current || Date.now());
        choice.action(waited > 3000);
    };

    return (
        <div className="dialogue-box bg-white/95 backdrop-blur-sm border-t-2 border-indigo-100 px-3 py-2 flex-shrink-0">
            <div className="max-w-3xl mx-auto h-full flex flex-col">
                <div className={`text-sm font-bold mb-0.5 ${speakerColor}`}>{speaker}</div>
                <div className="flex-1 text-slate-800 text-sm leading-relaxed overflow-y-auto">
                    <span>{displayed}</span>
                    {!done && <span className="typewriter-cursor" />}
                </div>
                {done && choices && choices.length > 0 && (
                    <div className="flex gap-1.5 mt-1 flex-wrap">
                        {choices.map((c, i) => (
                            <button key={i} onClick={() => handleChoice(c)}
                                className="px-3 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg text-xs font-medium hover:bg-indigo-100 hover:-translate-y-0.5 transition-all cursor-pointer">
                                {c.text}
                            </button>
                        ))}
                    </div>
                )}
                {done && !choices && onNext && (
                    <button onClick={onNext}
                        className="self-end mt-0.5 px-4 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg text-sm hover:bg-indigo-200 transition-all cursor-pointer">
                        다음 ▸
                    </button>
                )}
            </div>
        </div>
    );
}
