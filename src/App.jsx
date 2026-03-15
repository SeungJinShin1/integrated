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
import ModeSelect from './stages/ModeSelect';
import LowIntro from './stages/low_grade/LowIntro';
import LowStage1 from './stages/low_grade/LowStage1';
import LowStage2 from './stages/low_grade/LowStage2';
import LowStage3 from './stages/low_grade/LowStage3';
import LowStage4 from './stages/low_grade/LowStage4';
import LowEnding from './stages/low_grade/LowEnding';
import { FaHeart } from 'react-icons/fa6';

function WelcomeScreen({ onStart }) {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-slate-50 p-6 animate-fade-in relative">
      <div className="max-w-md w-full text-center space-y-8 bg-white p-10 rounded-3xl shadow-lg border border-slate-100">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-800 leading-tight">
          모두가 행복한 교실<br/>
          <span className="text-blue-500">장애이해교육</span>
        </h1>
        <p className="text-slate-500 text-lg break-keep">
          친구가 되는 순간, 원팀 프로젝트를 시작합니다!
        </p>
        <button
          onClick={onStart}
          className="w-full bg-blue-500 hover:bg-blue-600 active:scale-95 text-white font-bold py-4 rounded-xl shadow-md transition-all text-xl"
        >
          시작하기
        </button>
      </div>
    </div>
  );
}

function PasswordScreen({ onUnlock }) {
  const [pwd, setPwd] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (pwd === '260420') {
      onUnlock();
    } else {
      setError(true);
      setPwd('');
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-slate-50 p-6 animate-fade-in">
      <form onSubmit={handleSubmit} className="max-w-sm w-full bg-white p-8 rounded-3xl shadow-lg border border-slate-100 text-center space-y-6">
        <div className="text-5xl mb-2">🔒</div>
        <h2 className="text-2xl font-bold text-slate-800">비밀번호 입력</h2>
        <p className="text-sm text-slate-500">이 페이지는 접근이 제한되어 있습니다.</p>
        
        <div>
          <input
            type="password"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            className={`w-full text-center text-2xl tracking-widest p-4 rounded-xl border-2 outline-none transition-colors ${
              error ? 'border-red-400 bg-red-50 text-red-600' : 'border-slate-200 focus:border-blue-400 bg-slate-50'
            }`}
            placeholder="비밀번호"
            autoFocus
          />
          {error && <p className="text-red-500 text-sm mt-2 font-bold animate-shake">비밀번호가 일치하지 않습니다!</p>}
        </div>
        
        <button
          type="submit"
          className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-4 rounded-xl shadow-md transition-all"
        >
          확인
        </button>
      </form>
    </div>
  );
}

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

function HeartDisplay({ hearts }) {
  if (hearts === 0) return null;
  return (
    <div className="fixed top-4 right-4 z-[9999] bg-white/90 backdrop-blur-md rounded-full px-4 py-2 shadow-md border border-pink-200 flex items-center gap-2 animate-bounce-short">
      <FaHeart className="text-pink-500 text-xl" />
      <span className="font-bold text-pink-600 text-lg">{hearts}</span>
    </div>
  );
}

export default function App() {
  const { state, setStage, logAttempt, pendingStage, confirmStage } = useGame();
  const toolHandlerRef = useRef(null);
  const [isPortrait, setIsPortrait] = useState(false);

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('auth') === 'true';
  });
  const [isStarted, setIsStarted] = useState(() => {
    return sessionStorage.getItem('started') === 'true';
  });

  const handleUnlock = useCallback(() => {
    sessionStorage.setItem('auth', 'true');
    setIsAuthenticated(true);
  }, []);

  const handleStart = useCallback(() => {
    sessionStorage.setItem('started', 'true');
    setIsStarted(true);
  }, []);

  const handleHomeClick = useCallback(() => {
    if (confirm('홈으로 돌아가시겠습니까? 모든 진행 과정이 초기화됩니다.')) {
      localStorage.removeItem('hiddenPiece');
      sessionStorage.removeItem('started');
      window.location.reload();
    }
  }, []);

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
      case 'mode_select': return <ModeSelect />;
      case 'prologue': return <Prologue />;
      case 'stage-1': return <Stage1 onToolUse={toolHandlerRef} />;
      case 'stage-2': return <Stage2 onToolUse={toolHandlerRef} />;
      case 'stage-3': return <Stage3 onToolUse={toolHandlerRef} />;
      case 'stage-4': return <Stage4 onToolUse={toolHandlerRef} />;
      case 'stage-5': return <Stage5 onToolUse={toolHandlerRef} />;
      case 'stage-6': return <Stage6 onShowEncyclopedia={showEncyclopedia} />;
      case 'encyclopedia': return <Encyclopedia onBack={goBackFromEncyclopedia} />;
      case 'low_intro': return <LowIntro />;
      case 'low_stage1': return <LowStage1 />;
      case 'low_stage2': return <LowStage2 />;
      case 'low_stage3': return <LowStage3 />;
      case 'low_stage4': return <LowStage4 />;
      case 'low_ending': return <LowEnding />;
      default: return <ModeSelect />;
    }
  };

  if (!isAuthenticated) {
    return <PasswordScreen onUnlock={handleUnlock} />;
  }

  if (!isStarted) {
    return (
      <>
        <button 
          onClick={handleHomeClick}
          className="fixed top-4 left-4 z-[10000] bg-white/90 w-12 h-12 flex items-center justify-center rounded-full shadow-md border border-slate-200 text-2xl hover:bg-slate-100 hover:scale-110 active:scale-95 transition-all outline-none"
          title="처음으로"
        >
          🏠
        </button>
        <WelcomeScreen onStart={handleStart} />
      </>
    );
  }

  return (
    <>
      <button 
        onClick={handleHomeClick}
        className="fixed top-4 left-4 z-[10000] bg-white/90 w-12 h-12 flex items-center justify-center rounded-full shadow-md border border-slate-200 text-2xl hover:bg-slate-100 hover:scale-110 active:scale-95 transition-all outline-none"
        title="홈으로 가기 (초기화)"
      >
        🏠
      </button>

      {isPortrait && <LandscapePrompt />}
      {pendingStage && (
        <StageTransition
          targetStage={pendingStage}
          onComplete={confirmStage}
        />
      )}
      <div className="flex h-dvh w-screen bg-slate-50 font-sans overflow-hidden select-none">
        {state.gradeMode === 'low_grade' && <HeartDisplay hearts={state.hearts} />}
        <div className="flex-1 relative flex flex-col min-w-0">
          <div className="flex-1 relative overflow-y-auto overflow-x-hidden">
            {renderStage()}
          </div>
        </div>
        {state.gradeMode === 'high_grade' && !isPrologue && state.currentStage !== 'encyclopedia' && (
          <Dashboard onToolUse={handleToolUse} onShowEncyclopedia={showEncyclopedia} />
        )}
      </div>
    </>
  );
}
