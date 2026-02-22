import { useEffect, useRef } from 'react';

/**
 * Custom hook to play TTS (Text-to-Speech) automatically when a component mounts or text changes.
 * @param {string} text - The text to be spoken.
 * @param {boolean} [autoPlay=true] - Whether to play automatically on mount/change.
 */
export default function useTTS(text, autoPlay = true) {
    const speechRef = useRef(null);

    useEffect(() => {
        if (!text || typeof window === 'undefined' || !window.speechSynthesis) return;

        // Cancel any ongoing speech before starting a new one
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ko-KR';
        utterance.rate = 0.9; // Slightly slower for younger kids
        utterance.pitch = 1.1; // Slightly higher/friendlier pitch

        speechRef.current = utterance;

        if (autoPlay) {
            // Small delay to ensure the component is fully rendered and browsers don't block it initially
            const timeoutId = setTimeout(() => {
                window.speechSynthesis.speak(utterance);
            }, 300);

            return () => {
                clearTimeout(timeoutId);
                window.speechSynthesis.cancel();
            };
        }

        return () => {
            window.speechSynthesis.cancel();
        };
    }, [text, autoPlay]);

    const play = () => {
        if (speechRef.current && window.speechSynthesis) {
            window.speechSynthesis.cancel();
            window.speechSynthesis.speak(speechRef.current);
        }
    };

    const stop = () => {
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
    };

    return { play, stop };
}
