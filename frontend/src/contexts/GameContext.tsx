'use client';

import { createContext, useContext, useReducer, useCallback, useEffect, useState, ReactNode } from 'react';
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
  
  const completeStage = useCallback(async (stage: string) => {
    dispatch({ type: 'COMPLETE_STAGE', payload: stage });
    
    // Post progress to backend if logged in as student or teacher
    try {
      const savedUser = sessionStorage.getItem('authUser');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        if (user.authCode && user.uid) {
          await fetch(`${API_URL}/api/student/progress`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${user.authCode}`
            },
            body: JSON.stringify({
              authCode: user.authCode,
              studentId: user.uid,
              studentName: user.username,
              stage: stage,
              score: state.gradeMode === 'high_grade' ? Math.round((state.stats.understanding + state.stats.trust + state.stats.communication + state.stats.patience) / 4) : state.hearts * 25,
              usedTools: state.usedTools,
              stats: state.stats,
              logs: state.logs
            })
          });
        }
      }
    } catch (e) {
      console.error('Failed to post progress', e);
    }
  }, [state]);

  const toggleMute = useCallback(() => dispatch({ type: 'TOGGLE_MUTE' }), []);

  const resetGame = useCallback(() => {
    localStorage.removeItem('hiddenPiece');
    sessionStorage.removeItem('authUser');
    dispatch({ type: 'RESET' });
  }, []);

  return (
    <GameContext.Provider value={{
      state, dispatch, addStat, setStage, confirmStage, pendingStage, addInventory, useTool,
      logAttempt, logAccuracy, logWaiting, setStress, resetGame, setGradeMode, addHeart,
      completeStage, toggleMute
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
