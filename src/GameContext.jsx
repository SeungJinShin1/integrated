import { createContext, useContext, useReducer, useCallback, useEffect, useState } from 'react';

const initialState = {
    currentStage: 'mode_select', // changed from 'prologue'
    gradeMode: null, // 'low_grade' | 'high_grade'
    hearts: 0, // low-grade reward points
    player: { name: '나', gender: 'male' },
    npc: { name: '승주', gender: 'female' },
    stats: { understanding: 20, trust: 20, communication: 20, patience: 20 },
    inventory: [],
    usedTools: [],
    logs: { waiting_count: 0, tool_accuracy: 0, tool_attempts: 0 },
    stressGauge: 0,
    encyclopediaUnlocked: [],
};

function reducer(state, action) {
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
                encyclopediaUnlocked: state.encyclopediaUnlocked.includes(action.payload) ? state.encyclopediaUnlocked : [...state.encyclopediaUnlocked, action.payload]
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
        case 'LOAD_STATE':
            return { ...action.payload };
        case 'RESET':
            return { ...initialState };
        default:
            return state;
    }
}

const GameContext = createContext(null);

export function GameProvider({ children }) {
    const [state, dispatch] = useReducer(reducer, initialState, () => {
        const saved = localStorage.getItem('hiddenPiece');
        return saved ? { ...initialState, ...JSON.parse(saved) } : initialState;
    });

    // 스테이지 전환 시 대기 상태 (전환 애니메이션용)
    const [pendingStage, setPendingStage] = useState(null);

    useEffect(() => {
        localStorage.setItem('hiddenPiece', JSON.stringify(state));
    }, [state]);

    const addStat = useCallback((key, value) => dispatch({ type: 'ADD_STAT', payload: { key, value } }), []);
    // setStage: 전환 효과가 필요한 stage는 pendingStage에 저장, mode_select/prologue/encyclopedia/low_intro는 즉시 이동
    const setStage = useCallback((stage) => {
        if (stage === 'mode_select' || stage === 'prologue' || stage === 'encyclopedia' || stage === 'low_intro') {
            dispatch({ type: 'SET_STAGE', payload: stage });
        } else {
            setPendingStage(stage);
        }
    }, []);
    // confirmStage: 전환 애니메이션 완료 후 호출하여 실제 stage 변경
    const confirmStage = useCallback(() => {
        if (pendingStage) {
            dispatch({ type: 'SET_STAGE', payload: pendingStage });
            setPendingStage(null);
        }
    }, [pendingStage]);
    const addInventory = useCallback((id) => dispatch({ type: 'ADD_INVENTORY', payload: id }), []);
    const useTool = useCallback((id) => dispatch({ type: 'USE_TOOL', payload: id }), []);
    const logAttempt = useCallback(() => dispatch({ type: 'LOG_TOOL_ATTEMPT' }), []);
    const logAccuracy = useCallback(() => dispatch({ type: 'LOG_TOOL_ACCURACY' }), []);
    const logWaiting = useCallback(() => dispatch({ type: 'LOG_WAITING' }), []);
    const setStress = useCallback((v) => dispatch({ type: 'SET_STRESS', payload: v }), []);
    const setGradeMode = useCallback((mode) => dispatch({ type: 'SET_GRADE_MODE', payload: mode }), []);
    const addHeart = useCallback(() => dispatch({ type: 'ADD_HEART' }), []);
    const resetGame = useCallback(() => {
        if (confirm('진행 상황이 모두 초기화됩니다. 계속할까요?')) {
            localStorage.removeItem('hiddenPiece');
            dispatch({ type: 'RESET' });
        }
    }, []);

    return (
        <GameContext.Provider value={{
            state, dispatch, addStat, setStage, confirmStage, pendingStage, addInventory, useTool,
            logAttempt, logAccuracy, logWaiting, setStress, resetGame, setGradeMode, addHeart
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
