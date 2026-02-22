import { useState } from 'react';
import { STAGE_NAMES } from '../gameData';

export default function StageTransition({ targetStage, onComplete }) {
    const [visible, setVisible] = useState(true);

    const handleTap = () => {
        setVisible(false);
        onComplete();
    };

    if (!visible) return null;

    const stageName = STAGE_NAMES[targetStage] || targetStage;

    return (
        <div className="stage-transition-overlay cursor-pointer" onClick={handleTap}>
            <div className="stage-transition-text text-center px-6">
                <div className="text-5xl mb-4">
                    {targetStage === 'stage-1' ? '🦜' :
                        targetStage === 'stage-2' ? '💥' :
                            targetStage === 'stage-3' ? '🚂' :
                                targetStage === 'stage-4' ? '🧩' :
                                    targetStage === 'stage-5' ? '🌲' :
                                        targetStage === 'stage-6' ? '🔬' :
                                            targetStage.startsWith('low_') ? '🌱' : '🔮'}
                </div>
                <h2 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">{stageName}</h2>
                <div className="w-16 h-0.5 bg-indigo-400/50 mx-auto rounded-full" />
                <p className="text-white/70 mt-6 text-sm animate-pulse font-medium bg-black/20 py-2 px-4 rounded-full inline-block">화면을 터치해서 시작하세요</p>
            </div>
        </div>
    );
}
