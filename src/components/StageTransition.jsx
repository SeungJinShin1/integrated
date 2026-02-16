import { useState, useEffect } from 'react';
import { STAGE_NAMES } from '../gameData';

export default function StageTransition({ targetStage, onComplete }) {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
            onComplete();
        }, 2000);
        return () => clearTimeout(timer);
    }, [onComplete]);

    if (!visible) return null;

    const stageName = STAGE_NAMES[targetStage] || targetStage;

    return (
        <div className="stage-transition-overlay">
            <div className="stage-transition-text text-center px-6">
                <div className="text-5xl mb-4">
                    {targetStage === 'stage-1' ? '🦜' :
                        targetStage === 'stage-2' ? '💥' :
                            targetStage === 'stage-3' ? '🚂' :
                                targetStage === 'stage-4' ? '🧩' :
                                    targetStage === 'stage-5' ? '🌲' :
                                        targetStage === 'stage-6' ? '🔬' : '🔮'}
                </div>
                <h2 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">{stageName}</h2>
                <div className="w-16 h-0.5 bg-indigo-400/50 mx-auto rounded-full" />
            </div>
        </div>
    );
}
