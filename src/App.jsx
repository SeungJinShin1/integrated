import { useRef, useCallback } from 'react';
import { useGame } from './GameContext';
import Dashboard from './components/Dashboard';
import Prologue from './stages/Prologue';
import Stage1 from './stages/Stage1';
import Stage2 from './stages/Stage2';
import Stage3 from './stages/Stage3';
import Stage4 from './stages/Stage4';
import Stage5 from './stages/Stage5';
import Stage6 from './stages/Stage6';
import Ending from './stages/Ending';
import Encyclopedia from './stages/Encyclopedia';

export default function App() {
  const { state, setStage, logAttempt } = useGame();
  const toolHandlerRef = useRef(null);

  const handleToolUse = useCallback((id) => {
    logAttempt();
    if (toolHandlerRef.current) toolHandlerRef.current(id);
  }, [logAttempt]);

  const showEncyclopedia = useCallback(() => setStage('encyclopedia'), [setStage]);
  const goBackFromEncyclopedia = useCallback(() => {
    if (state.usedTools.length >= 5) setStage('ending');
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
      case 'stage-6': return <Stage6 />;
      case 'ending': return <Ending onShowEncyclopedia={showEncyclopedia} />;
      case 'encyclopedia': return <Encyclopedia onBack={goBackFromEncyclopedia} />;
      default: return <Prologue />;
    }
  };

  return (
    <div className="flex h-dvh w-screen bg-slate-50 font-sans overflow-hidden select-none">
      <div className="flex-1 relative flex flex-col">
        <div className="flex-1 relative overflow-hidden">
          {renderStage()}
        </div>
      </div>
      {!isPrologue && state.currentStage !== 'encyclopedia' && (
        <Dashboard onToolUse={handleToolUse} onShowEncyclopedia={showEncyclopedia} />
      )}
    </div>
  );
}
