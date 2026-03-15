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
    <div className="flex flex-col items-center justify-center w-full h-dvh bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 p-4 sm:p-6 md:p-8 animate-fade-in relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
        <div className="absolute top-1/4 -right-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-1/3 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-3xl w-full text-center space-y-6 sm:space-y-8 md:space-y-10 bg-white/80 backdrop-blur-xl p-8 sm:p-12 md:p-16 rounded-[2rem] sm:rounded-[3rem] shadow-2xl border border-white/50 relative z-10 flex flex-col items-center">
        
        <div className="space-y-3 sm:space-y-4">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-indigo-500 tracking-tight">
            달라서 더 빛나는 우리들의 이야기
          </h2>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-800 leading-tight drop-shadow-sm">
            우리 반 <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">보물찾기</span> 💎
          </h1>
        </div>

        <div className="bg-white/50 p-6 sm:p-8 rounded-3xl border border-indigo-100 shadow-inner max-w-2xl">
          <p className="text-slate-600 text-base sm:text-lg md:text-xl leading-relaxed break-keep font-medium">
            자신만의 특별한 행동과 소리로 마음을 전하는 친구가 있어요.<br className="hidden md:block"/>
            <span className="text-indigo-600 font-bold">'기다림'</span>이라는 열쇠로 친구의 마음 상자를 열면, 누구보다 정직하고 순수한 보물을 만날 수 있답니다.<br className="hidden md:block"/>
            <br className="block md:hidden"/>
            나와 조금 다른 친구의 <span className="text-orange-500 font-bold">특별한 보물</span>을 찾으러 가볼까요?
          </p>
        </div>

        <button
          onClick={onStart}
          className="group relative inline-flex items-center justify-center px-8 py-4 sm:px-10 sm:py-5 font-bold text-white transition-all duration-200 bg-gradient-to-r from-indigo-500 to-purple-600 border border-transparent rounded-full hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 shadow-[0_10px_20px_rgba(99,102,241,0.4)] hover:shadow-[0_15px_30px_rgba(99,102,241,0.6)] hover:-translate-y-1 active:translate-y-0 text-xl sm:text-2xl w-full sm:w-auto"
        >
          보물찾기 출발! 🚀
          <span className="absolute right-6 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-300">
            →
          </span>
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
