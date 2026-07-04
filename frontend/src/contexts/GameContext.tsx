'use client';

import { createContext, useContext, useReducer, useCallback, useEffect, useState, useRef, ReactNode } from 'react';
import { GameState, GameAction, GradeMode, GameStats } from '@/types';

const initialState: GameState = {
  currentStage: 'mode_select',
  gradeMode: null,
  hearts: 0,
  player: { name: '나', gender: 'male' },
  npc: { name: '승주', gender: 'female' },
  stats: { understanding: 20, trust: 20, communication: 20, patience: 20 },
  inventory: [],
  usedTools: [],
  logs: { waiting_count: 0, tool_accuracy: 0, tool_attempts: 0 },
  stressGauge: 0,
  encyclopediaUnlocked: [],
  completedStages: [],
  isMuted: false,
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const DEFAULT_PLAYER_NAME = '나';

/** sessionStorage에 저장된 로그인 정보(인증코드 로그인)를 읽습니다. 없으면 null. */
function getAuthUser(): { authCode: string; uid: string; username?: string } | null {
  try {
    const saved = sessionStorage.getItem('authUser');
    if (!saved) return null;
    const user = JSON.parse(saved);
    return user?.authCode && user?.uid ? user : null;
  } catch {
    return null;
  }
}

/** 캐릭터 생성 때 입력한 "나의 이름"이 곧 대시보드의 학생 ID가 됩니다.
 *  Firestore 문서 ID로 쓸 수 없는 문자만 치환하고, 이름을 입력하지 않은
 *  (기본 이름 '나') 학생은 세션 uid로 구분해 서로 섞이지 않게 합니다. */
function studentIdFrom(playerName: string, fallbackUid: string): string {
  const sanitized = (playerName || '').trim().replace(/[/\\#?%[\]{}]/g, '_').slice(0, 30);
  const unusable = !sanitized
    || sanitized === DEFAULT_PLAYER_NAME
    || sanitized === '.' || sanitized === '..'
    || /^__.*__$/.test(sanitized); // Firestore 예약 문서 ID
  return unusable ? fallbackUid : sanitized;
}

/** 진행 데이터 전송. Render 콜드스타트/일시적 네트워크 오류에 대비해
 *  5xx·네트워크 실패는 재시도하고, 4xx는 즉시 포기합니다. */
async function postWithRetry(path: string, body: unknown, authCode: string, attempts = 3): Promise<boolean> {
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(`${API_URL}${path}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authCode}`,
        },
        body: JSON.stringify(body),
      });
      if (res.ok) return true;
      if (res.status < 500) {
        console.error(`Sync rejected (${res.status}) for ${path}:`, await res.text().catch(() => ''));
        return false;
      }
    } catch {
      // network error / server waking up — retry below
    }
    if (i < attempts - 1) await new Promise(r => setTimeout(r, 2000 * (i + 1)));
  }
  console.error(`Sync failed after ${attempts} attempts: ${path}`);
  return false;
}

function reducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_PLAYER_GENDER':
      return { ...state, player: { ...state.player, gender: action.payload } };
    case 'SET_PLAYER':
      return { ...state, player: { ...state.player, ...action.payload } };
    case 'SET_NPC':
      return { ...state, npc: { ...state.npc, ...action.payload } };
    case 'SET_STAGE':
      return { ...state, currentStage: action.payload };
    case 'SET_GRADE_MODE':
      return { ...state, gradeMode: action.payload };
    case 'ADD_HEART':
      return { ...state, hearts: state.hearts + 1 };
    case 'ADD_STAT': {
      const { key, value } = action.payload;
      return { ...state, stats: { ...state.stats, [key]: Math.min(100, Math.max(0, state.stats[key] + value)) } };
    }
    case 'ADD_INVENTORY':
      if (state.inventory.includes(action.payload)) return state;
      return {
        ...state,
        inventory: [...state.inventory, action.payload],
        encyclopediaUnlocked: state.encyclopediaUnlocked.includes(action.payload)
          ? state.encyclopediaUnlocked
          : [...state.encyclopediaUnlocked, action.payload]
      };
    case 'USE_TOOL':
      if (state.usedTools.includes(action.payload)) return state;
      return { ...state, usedTools: [...state.usedTools, action.payload] };
    case 'LOG_TOOL_ATTEMPT':
      return { ...state, logs: { ...state.logs, tool_attempts: state.logs.tool_attempts + 1 } };
    case 'LOG_TOOL_ACCURACY':
      return { ...state, logs: { ...state.logs, tool_accuracy: state.logs.tool_accuracy + 1 } };
    case 'LOG_WAITING':
      return { ...state, logs: { ...state.logs, waiting_count: state.logs.waiting_count + 1 } };
    case 'SET_STRESS':
      return { ...state, stressGauge: action.payload };
    case 'COMPLETE_STAGE':
      if (state.completedStages.includes(action.payload)) return state;
      return { ...state, completedStages: [...state.completedStages, action.payload] };
    case 'TOGGLE_MUTE':
      return { ...state, isMuted: !state.isMuted };
    case 'LOAD_STATE':
      return { ...action.payload };
    case 'RESET':
      return { ...initialState };
    default:
      return state;
  }
}

interface GameContextValue {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  addStat: (key: keyof GameStats, value: number) => void;
  setStage: (stage: string) => void;
  pendingStage: string | null;
  confirmStage: () => void;
  addInventory: (id: string) => void;
  useTool: (id: string) => void;
  logAttempt: () => void;
  logAccuracy: () => void;
  logWaiting: () => void;
  setStress: (v: number) => void;
  resetGame: () => void;
  setGradeMode: (mode: GradeMode) => void;
  addHeart: () => void;
  registerStudent: (playerName: string) => void;
  startStage: (stage: string) => void;
  completeStage: (stage: string) => Promise<void>;
  toggleMute: () => void;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState, () => {
    if (typeof window === 'undefined') return initialState;
    const saved = localStorage.getItem('hiddenPiece');
    return saved ? { ...initialState, ...JSON.parse(saved) } : initialState;
  });

  const [pendingStage, setPendingStage] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('hiddenPiece', JSON.stringify(state));
  }, [state]);

  const addStat = useCallback((key: keyof GameStats, value: number) =>
    dispatch({ type: 'ADD_STAT', payload: { key, value } }), []);

  const setStage = useCallback((stage: string) => {
    if (['mode_select', 'prologue', 'encyclopedia', 'low_intro'].includes(stage)) {
      dispatch({ type: 'SET_STAGE', payload: stage });
    } else {
      setPendingStage(stage);
    }
  }, []);

  const confirmStage = useCallback(() => {
    if (pendingStage) {
      dispatch({ type: 'SET_STAGE', payload: pendingStage });
      setPendingStage(null);
    }
  }, [pendingStage]);

  const addInventory = useCallback((id: string) => dispatch({ type: 'ADD_INVENTORY', payload: id }), []);
  const useTool = useCallback((id: string) => dispatch({ type: 'USE_TOOL', payload: id }), []);
  const logAttempt = useCallback(() => dispatch({ type: 'LOG_TOOL_ATTEMPT' }), []);
  const logAccuracy = useCallback(() => dispatch({ type: 'LOG_TOOL_ACCURACY' }), []);
  const logWaiting = useCallback(() => dispatch({ type: 'LOG_WAITING' }), []);
  const setStress = useCallback((v: number) => dispatch({ type: 'SET_STRESS', payload: v }), []);
  const setGradeMode = useCallback((mode: GradeMode) => dispatch({ type: 'SET_GRADE_MODE', payload: mode }), []);
  const addHeart = useCallback(() => dispatch({ type: 'ADD_HEART' }), []);
  
  // 콜백들이 항상 최신 상태를 읽으면서도 함수 정체성은 안정적으로 유지
  // (페이지 useEffect 의존성으로 써도 재실행 폭주가 없도록)
  const stateRef = useRef(state);
  useEffect(() => { stateRef.current = state; });

  /** 캐릭터 생성 직후 학생을 학급에 등록 — 첫 단계를 완료하기 전에도
   *  교사 대시보드에 바로 나타나게 합니다. */
  const registerStudent = useCallback((playerName: string) => {
    const user = getAuthUser();
    if (!user) return;
    const name = (playerName || '').trim() || DEFAULT_PLAYER_NAME;
    void postWithRetry('/api/student/join', {
      authCode: user.authCode,
      studentId: studentIdFrom(name, user.uid),
      studentName: name,
      gradeMode: stateRef.current.gradeMode || undefined,
    }, user.authCode);
  }, []);

  const syncStage = useCallback(async (stage: string, status: 'in_progress' | 'completed'): Promise<boolean> => {
    const user = getAuthUser();
    if (!user) return false;
    const s = stateRef.current;
    const name = (s.player.name || user.username || DEFAULT_PLAYER_NAME).trim() || DEFAULT_PLAYER_NAME;
    return postWithRetry('/api/student/progress', {
      authCode: user.authCode,
      studentId: studentIdFrom(name, user.uid),
      studentName: name,
      stage,
      score: status === 'completed'
        ? (s.gradeMode === 'high_grade'
          ? Math.round((s.stats.understanding + s.stats.trust + s.stats.communication + s.stats.patience) / 4)
          : s.hearts * 25)
        : 0,
      usedTools: s.usedTools,
      stats: s.stats,
      logs: s.logs,
      status,
      gradeMode: s.gradeMode || undefined,
    }, user.authCode);
  }, []);

  // 이번 세션에서 이미 "진행 중"을 보낸 단계는 다시 보내지 않음
  const startedStagesRef = useRef<Set<string>>(new Set());

  /** 단계/에피소드에 들어온 순간 "진행 중"(주황불)으로 표시.
   *  전송에 실패하면 Set에서 제거해 다음 진입 때 다시 시도합니다. */
  const startStage = useCallback((stage: string) => {
    if (startedStagesRef.current.has(stage)) return;
    startedStagesRef.current.add(stage);
    void syncStage(stage, 'in_progress').then(ok => {
      if (!ok) startedStagesRef.current.delete(stage);
    });
  }, [syncStage]);

  const completeStage = useCallback(async (stage: string) => {
    dispatch({ type: 'COMPLETE_STAGE', payload: stage });
    await syncStage(stage, 'completed');
  }, [syncStage]);

  const toggleMute = useCallback(() => dispatch({ type: 'TOGGLE_MUTE' }), []);

  const resetGame = useCallback(() => {
    localStorage.removeItem('hiddenPiece');
    sessionStorage.removeItem('authUser');
    // 같은 태블릿에서 다음 학생이 시작할 때 진행 중 표시가 다시 전송되도록 초기화
    startedStagesRef.current.clear();
    dispatch({ type: 'RESET' });
  }, []);

  return (
    <GameContext.Provider value={{
      state, dispatch, addStat, setStage, confirmStage, pendingStage, addInventory, useTool,
      logAttempt, logAccuracy, logWaiting, setStress, resetGame, setGradeMode, addHeart,
      registerStudent, startStage, completeStage, toggleMute
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
