import { useRef, useCallback, useState, useEffect } from 'react';
import { useGame } from './GameContext';
import Dashboard from './components/Dashboard';
import StageTransition from './components/StageTransition';
import Prologue from './stages/Prologue';
import Stage1 from './stages/Stage1';
import Stage2 from './stages/Stage2';
import Stage3 from './stages/Stage3';
import Stage4 from './stages/Stage4';
import Stage5 from './stages/Stage5';
import Stage6 from './stages/Stage6';
import Encyclopedia from './stages/Encyclopedia';

function LandscapePrompt() {
  return (
    <div className="landscape-prompt">
      <div className="text-center p-8 text-white">
        <div className="text-6xl mb-4">📱🔄</div>
        <h2 className="text-xl font-bold mb-2">화면을 가로로 돌려주세요!</h2>
        <p className="text-sm text-white/80">이 앱은 가로 모드에서 최적화되어 있어요.</p>
        <p className="text-xs text-white/60 mt-2">Landscape mode recommended</p>
      </div>
    </div>
  );
}

export default function App() {
  const { state, setStage, logAttempt, pendingStage, confirmStage } = useGame();
  const toolHandlerRef = useRef(null);
  const [isPortrait, setIsPortrait] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      const isMobile = window.innerWidth < 768;
      const portrait = window.innerHeight > window.innerWidth;
      setIsPortrait(isMobile && portrait);
    };
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', () => setTimeout(checkOrientation, 100));
    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  const handleToolUse = useCallback((id) => {
    logAttempt();
    if (toolHandlerRef.current) toolHandlerRef.current(id);
  }, [logAttempt]);

  const showEncyclopedia = useCallback(() => setStage('encyclopedia'), [setStage]);
  const goBackFromEncyclopedia = useCallback(() => {
    if (state.usedTools.length >= 5) setStage('stage-6');
    else setStage('prologue');
  }, [state.usedTools, setStage]);

  const isPrologue = state.currentStage === 'prologue';

  const renderStage = () => {
    switch (state.currentStage) {
      case 'prologue': return <Prologue />;
      case 'stage-1': return <Stage1 onToolUse={toolHandlerRef} />;
      case 'stage-2': return <Stage2 onToolUse={toolHandlerRef} />;
      case 'stage-3': return <Stage3 onToolUse={toolHandlerRef} />;
      case 'stage-4': return <Stage4 onToolUse={toolHandlerRef} />;
      case 'stage-5': return <Stage5 onToolUse={toolHandlerRef} />;
      case 'stage-6': return <Stage6 onShowEncyclopedia={showEncyclopedia} />;
      case 'encyclopedia': return <Encyclopedia onBack={goBackFromEncyclopedia} />;
      default: return <Prologue />;
    }
  };

  return (
    <>
      {isPortrait && <LandscapePrompt />}
      {pendingStage && (
        <StageTransition
          targetStage={pendingStage}
          onComplete={confirmStage}
        />
      )}
      <div className="flex h-dvh w-screen bg-slate-50 font-sans overflow-hidden select-none">
        <div className="flex-1 relative flex flex-col min-w-0">
          <div className="flex-1 relative overflow-y-auto overflow-x-hidden">
            {renderStage()}
          </div>
        </div>
        {!isPrologue && state.currentStage !== 'encyclopedia' && (
          <Dashboard onToolUse={handleToolUse} onShowEncyclopedia={showEncyclopedia} />
        )}
      </div>
    </>
  );
}
