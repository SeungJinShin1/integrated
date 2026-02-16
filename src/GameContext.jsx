import { createContext, useContext, useReducer, useCallback, useEffect } from 'react';

const initialState = {
    currentStage: 'prologue',
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

    useEffect(() => {
        localStorage.setItem('hiddenPiece', JSON.stringify(state));
    }, [state]);

    const addStat = useCallback((key, value) => dispatch({ type: 'ADD_STAT', payload: { key, value } }), []);
    const setStage = useCallback((stage) => dispatch({ type: 'SET_STAGE', payload: stage }), []);
    const addInventory = useCallback((id) => dispatch({ type: 'ADD_INVENTORY', payload: id }), []);
    const useTool = useCallback((id) => dispatch({ type: 'USE_TOOL', payload: id }), []);
    const logAttempt = useCallback(() => dispatch({ type: 'LOG_TOOL_ATTEMPT' }), []);
    const logAccuracy = useCallback(() => dispatch({ type: 'LOG_TOOL_ACCURACY' }), []);
    const logWaiting = useCallback(() => dispatch({ type: 'LOG_WAITING' }), []);
    const setStress = useCallback((v) => dispatch({ type: 'SET_STRESS', payload: v }), []);
    const resetGame = useCallback(() => {
        if (confirm('진행 상황이 모두 초기화됩니다. 계속할까요?')) {
            localStorage.removeItem('hiddenPiece');
            dispatch({ type: 'RESET' });
        }
    }, []);

    return (
        <GameContext.Provider value={{
            state, dispatch, addStat, setStage, addInventory, useTool,
            logAttempt, logAccuracy, logWaiting, setStress, resetGame
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
